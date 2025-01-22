export default {
    expo: {
      web: {
        favicon: "./assets/favicon.png",
        pwa: {
          manifest: {
            short_name: "Step Chique",
            name: "Step Chique",
            start_url: ".",
            display: "standalone",
            background_color: "#A9957B",
            theme_color: "#A9957B",
            icons: [
              {
                src: "./assets/icon.png",
                sizes: "192x192",
                type: "image/png",
              },
              {
                src: "./assets/icon.png",
                sizes: "512x512",
                type: "image/png",
              },
            ],
          },
        },
      },
    },
  };
  