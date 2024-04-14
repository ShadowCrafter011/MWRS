class HomeController < ApplicationController
    def spotify_search; end

    def spotify_results
        client_token = Mwrs.redis.get("client_token")
        token_expires = Mwrs.redis.get("client_token_expire").to_i
        unless client_token.present? && token_expires > Time.now.to_i
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
        end

        @offset = params[:page].to_i || 1
        spotify_results = HTTParty.get(
            "https://api.spotify.com/v1/search?q=#{params[:query]}&type=album,track,playlist&offset=#{(@offset - 1) * 20}",
            headers: {
                authorization: "Bearer #{client_token}"
            }
        )

        @results = {
            playlists: {
                name: "Playlists",
                items: []
            },
            albums: {
                name: "Albums",
                items: []
            },
            tracks: {
                name: "Tracks",
                items: []
            }
        }
        spotify_results["playlists"]["items"].each do |playlist|
            @results[:playlists][:items].append(
                {
                    name: playlist["name"],
                    image: playlist["images"].first["url"],
                    owner: playlist["owner"]["display_name"],
                    uri: playlist["uri"]
                }
            )
        end
        spotify_results["albums"]["items"].each do |album|
            artists = album["artists"].map { |artist| artist["name"] }
            @results[:albums][:items].append(
                {
                    name: album["name"],
                    image: album["images"].first["url"],
                    owner: artists.join(", "),
                    uri: album["uri"]
                }
            )
        end
        spotify_results["tracks"]["items"].each do |track|
            puts track
            artists = track["artists"].map { |artist| artist["name"] }
            @results[:tracks][:items].append(
                {
                    name: track["name"],
                    image: track["album"]["images"].first["url"],
                    owner: artists.join(", "),
                    uri: track["uri"]
                }
            )
        end
    end

    def spotify
        @spotify_id = params[:spotify_id]
    end
end
