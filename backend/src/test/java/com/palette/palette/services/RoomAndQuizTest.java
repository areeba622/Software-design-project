package com.palette.palette.services;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.palette.palette.dto.CartItemRequestDTO;
import com.palette.palette.dto.CustomRoomResponseDTO;
import com.palette.palette.dto.DesignQuizResponseDTO;
import com.palette.palette.dto.ProductDTO;
import com.palette.palette.dto.RoomBuilderRequestDTO;
import com.palette.palette.exceptions.ResourceNotFoundException;
import com.palette.palette.repository.DesignQuizRepository;

/**
 * Room Builder pricing/ownership and the style quiz.
 * Seed prices: 75 = micro-cement flooring 100/sqft, 117 = sunburst wallpaper 55/sqft,
 * 1 = bed 45,000, 6 = shelf 12,000.
 */
@SpringBootTest
class RoomAndQuizTest {

    @Autowired private AuthService authService;
    @Autowired private RoomBuilderService roomBuilderService;
    @Autowired private CartManager cartManager;
    @Autowired private DesignQuizService designQuizService;
    @Autowired private DesignQuizRepository designQuizRepository;

    private Long userId;

    @BeforeEach
    void registerFreshUser() {
        userId = TestUsers.register(authService).getUserId();
    }

    // ── Room Builder ─────────────────────────────────────────────────────────

    @Test
    void roomPriceUsesFloorAreaForFlooringAndWallAreaForWallpaper() {
        // 10 x 12 room: floor 120 sq ft, walls 2 x (10 + 12) x 10 = 440 sq ft
        CustomRoomResponseDTO room = roomBuilderService.buildRoom(userId,
                new RoomBuilderRequestDTO("LIVING_ROOM", 10, 12, 75L, 117L, List.of(1L, 6L)));

        double expected = 100 * 120 + 55 * 440 + 45_000 + 12_000;
        assertThat(room.getTotalPrice()).isEqualTo(expected);
        assertThat(room.getFlooring()).isEqualTo("Sleek Micro-Cement Flooring");
        assertThat(room.getWallpaper()).isEqualTo("Earthy Sunburst Pattern Wallpaper");
        assertThat(room.getFurnitureItems()).containsExactly("Minimalist Platform Bed", "Minimalist Floating Shelf");
    }

    @Test
    void flooringMustBeAFlooringProduct() {
        assertThatThrownBy(() -> roomBuilderService.buildRoom(userId,
                new RoomBuilderRequestDTO("BEDROOM", 10, 10, 1L, null, List.of(1L))))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("not a flooring");
    }

    @Test
    void unknownFurnitureOrRoomTypeIsRejected() {
        assertThatThrownBy(() -> roomBuilderService.buildRoom(userId,
                new RoomBuilderRequestDTO("BEDROOM", 10, 10, null, null, List.of(99_999L))))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> roomBuilderService.buildRoom(userId,
                new RoomBuilderRequestDTO("GARAGE", 10, 10, null, null, List.of(1L))))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void editingARoomKeepsItInTheCartWithTheNewPrice() {
        CustomRoomResponseDTO room = roomBuilderService.buildRoom(userId,
                new RoomBuilderRequestDTO("BEDROOM", 10, 10, null, null, List.of(1L)));
        cartManager.addItemToCart(userId, new CartItemRequestDTO(room.getRoomId(), 1, "CUSTOM_ROOM"));

        CustomRoomResponseDTO edited = roomBuilderService.updateRoom(room.getRoomId(), userId,
                new RoomBuilderRequestDTO("BEDROOM", 10, 10, null, null, List.of(1L, 6L)));

        assertThat(edited.getRoomId()).isEqualTo(room.getRoomId());
        assertThat(cartManager.getCartSummary(userId).getGrandTotal()).isEqualTo(57_000);
    }

    @Test
    void deletingARoomRemovesItFromTheCart() {
        CustomRoomResponseDTO room = roomBuilderService.buildRoom(userId,
                new RoomBuilderRequestDTO("BEDROOM", 10, 10, null, null, List.of(1L)));
        cartManager.addItemToCart(userId, new CartItemRequestDTO(room.getRoomId(), 1, "CUSTOM_ROOM"));

        roomBuilderService.deleteRoom(room.getRoomId(), userId);

        assertThat(cartManager.getCartSummary(userId).getLines()).isEmpty();
    }

    @Test
    void usersCannotSeeOrBuyOtherUsersRooms() {
        CustomRoomResponseDTO room = roomBuilderService.buildRoom(userId,
                new RoomBuilderRequestDTO("BEDROOM", 10, 10, null, null, List.of(1L)));
        Long otherUser = TestUsers.register(authService).getUserId();

        assertThatThrownBy(() -> roomBuilderService.getRoomById(room.getRoomId(), otherUser))
                .isInstanceOf(ResourceNotFoundException.class);
        assertThatThrownBy(() -> cartManager.addItemToCart(otherUser,
                new CartItemRequestDTO(room.getRoomId(), 1, "CUSTOM_ROOM")))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ── Style quiz ───────────────────────────────────────────────────────────

    @Test
    void quizReturnsTheCuratedProductsWithTheStyleDiscount() {
        DesignQuizResponseDTO result = designQuizService.submitQuiz("scandinavian", "dining_room", userId);

        assertThat(result.getAestheticStyle()).isEqualTo("SCANDINAVIAN");
        assertThat(result.getRecommendationTitle()).isEqualTo("Scandinavian Dining Room");
        assertThat(result.getBundleProducts()).extracting(ProductDTO::id).containsExactly(48L, 51L, 54L);
        assertThat(result.getRecommendedBundle().getDiscountFactor()).isEqualTo(0.92);
        assertThat(result.getRecommendedBundle().getTotalPrice()).isEqualTo(14_000 + 15_500 + 7_800);
    }

    @Test
    void unknownCombinationReturnsTheNullObjectInsteadOfFailing() {
        DesignQuizResponseDTO result = designQuizService.submitQuiz("BOHEMIAN", "GARAGE", userId);

        assertThat(result.getAestheticStyle()).isEqualTo("NONE");
        assertThat(result.getBundleProducts()).isEmpty();
        assertThat(designQuizRepository.findByUserId(userId)).isEmpty(); // not saved
    }

    @Test
    void latestQuizIsRememberedForLoggedInUsers() {
        designQuizService.submitQuiz("MINIMALIST", "KITCHEN", userId);
        designQuizService.submitQuiz("BOHEMIAN", "BEDROOM", userId);

        DesignQuizResponseDTO latest = designQuizService.getLatestRecommendation(userId);

        assertThat(latest.getAestheticStyle()).isEqualTo("BOHEMIAN");
        assertThat(latest.getRoomType()).isEqualTo("BEDROOM");
    }

    @Test
    void guestQuizIsNotSavedAndNoLatestExists() {
        designQuizService.submitQuiz("MINIMALIST", "KITCHEN", null);

        assertThatThrownBy(() -> designQuizService.getLatestRecommendation(userId))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
