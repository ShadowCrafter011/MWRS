class ApplicationController < ActionController::Base
    def get_access_token
        client_token = Mwrs.redis.get("client_token")
        token_expires = Mwrs.redis.get("client_token_expire").to_i

        return client_token if client_token.present? && token_expires > Time.now.to_i

        spotify_id = Rails.application.credentials[:spotify_id]
        spotify_secret = Rails.application.credentials[:spotify_secret]
        auth_token = Base64.strict_encode64("#{spotify_id}:#{spotify_secret}")
        response = HTTParty.post(
            "https://accounts.spotify.com/api/token",
            body: "grant_type=client_credentials",
            headers: {
                content_type: "application/x-www-form-urlencoded",
                authorization: "Basic #{auth_token}"
            }
        )
        json = JSON.parse response.body
        client_token = json["access_token"]
        expires = json["expires_in"] - 20
        Mwrs.redis.set("client_token", client_token)
        Mwrs.redis.set("client_token_expire", (Time.now + expires.seconds).to_i)
        client_token
    end
end
