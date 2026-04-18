package com.jorgemonteiro.home_app.model.dtos.shared;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for photo fields.
 * <ul>
 *   <li>{@code data} — base64-encoded data URI sent by the client on writes (e.g. {@code data:image/jpeg;base64,...})</li>
 *   <li>{@code url} — relative URL returned by the server on reads (e.g. {@code /api/images/user-1-profile.jpeg})</li>
 * </ul>
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PhotoDTO {
    private String data;
    private String url;
}
