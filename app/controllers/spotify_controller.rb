class SpotifyController < ApplicationController
    def play
        return redirect_to spotify_login_path unless cookies.encrypted[:auth].present?

        @auth_token = cookies.encrypted[:auth]
        @auth_expire = cookies.encrypted[:auth_expire].to_i - Time.now.to_i

        return unless cookies.encrypted[:auth_expire].to_i < Time.now.to_i

        @auth_token = refresh_auth
        @auth_expire = cookies.encrypted[:auth_expire].to_i - Time.now.to_i
    end

    def login
        client_id = Rails.application.credentials[:spotify_id]
        state = SecureRandom.hex(16)
        session[:state] = state
        scope = "streaming,user-read-email,user-read-private"
        get_params = "response_type=code&client_id=#{client_id}&scope=#{scope}&redirect_uri=#{spotify_callback_url}&state=#{state}"
        redirect_to "https://accounts.spotify.com/authorize/?#{get_params}", allow_other_host: true
    end

    def refresh
        auth_data = refresh_auth
        render json: { auth: auth_data.first, auth_expire: auth_data.last }
    end

    def callback
        return redirect_to root_path, alert: "Something went wrong. Please try again later" unless params[:state] == session[:state]

        response = HTTParty.post(
            "https://accounts.spotify.com/api/token",
            body: "grant_type=authorization_code&code=#{params[:code]}&redirect_uri=#{spotify_callback_url}",
            headers: {
                content_type: "application/x-www-form-urlencoded",
                authorization: "Basic #{app_auth}"
            }
        )
        return redirect_to root_path, alert: "Something went wrong. Please try again later" unless response.code == 200

        json = JSON.parse response.body
        return redirect_to root_path, alert: "Something went wrong. Please try again later" unless json["access_token"].present?

        set_cookies json
        redirect_to spotify_play_path
    end

    private

    def refresh_auth
        response = HTTParty.post(
            "https://accounts.spotify.com/api/token",
            body: "grant_type=refresh_token&refresh_token=#{cookies.encrypted[:refresh]}",
            headers: {
                content_type: "application/x-www-form-urlencoded",
                authorization: "Basic #{app_auth}"
            }
        )
        puts response
        return nil unless response.code == 200

        json = JSON.parse response.body
        puts "HELLO #{json["refresh_token"]}"
        return nil unless json["access_token"]

        set_cookies json
        [json["access_token"], json["expires_in"] - 100]
    end

    def app_auth
        spotify_id = Rails.application.credentials[:spotify_id]
        spotify_secret = Rails.application.credentials[:spotify_secret]
        Base64.strict_encode64("#{spotify_id}:#{spotify_secret}")
    end

    def set_cookies(json)
        cookies.encrypted[:auth] = json["access_token"]
        cookies.encrypted[:refresh] = json["refresh_token"] if json["refresh_token"].present?
        cookies.encrypted[:auth_expire] = (Time.now + (json["expires_in"] - 120).seconds).to_i
    end
end
