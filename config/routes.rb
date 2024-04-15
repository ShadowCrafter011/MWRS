Rails.application.routes.draw do
    # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

    # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
    # Can be used by load balancers and uptime monitors to verify that the app is live.
    get "up" => "rails/health#show", as: :rails_health_check

    # Defines the root path route ("/")
    root "home#index"

    get "standalone" => "home#standalone", as: "standalone"
    get "spotify" => "home#spotify_search", as: "spotify_search"
    get "spotify/results" => "home#spotify_results", as: "spotify_results"
    get "spotify/:spotify_id" => "home#spotify", as: "spotify_play"
end
