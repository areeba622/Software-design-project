package com.palette.palette.dto;

import com.palette.palette.entities.User.CurrencyPreference;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
 
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponseDTO {
     
    private Long               userId;
    private String             email;
    private String             fullName;
    private CurrencyPreference currencyPreference;
    private String             message;     // e.g. "Login successful"

}
