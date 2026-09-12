package com.palette.palette.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartResponseDTO {

    private Long cartId;
    private Long userId;
    private List<CartLineDTO> lines;

    // Composite-calculated grand total across all line items
    private double grandTotal;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CartLineDTO {
        private Long cartItemId;
        private String itemType;        // "PRODUCT" or "BUNDLE"
        private Long itemId;
        private String itemName;
        private int quantity;
        private double unitPrice;       // from InventoryItem.getPrice()
        private double lineTotal;       // unitPrice * quantity
        private List<String> subItems;  // e.g. names of products inside a bundle or custom room
    }
}