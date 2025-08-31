export const API_CONFIG = {
  UNSPLASH: {
    ACCESS_KEY: process.env.UNSPLASH_ACCESS_KEY || "HT7RNqQ_jGXVGcttet8ttcmebRG5wD9qXi3DhZCJnQg",
    SECRET_KEY: process.env.UNSPLASH_SECRET_KEY || "dsx2MbJaK69lkKly5Wc-bdG4kXD5Wv5SK9aYh0Co1cI",
    BASE_URL: "https://api.unsplash.com",
  },
  PEXELS: {
    API_KEY: process.env.PEXELS_API_KEY || "WxPmRxrHuriDMZQKMU5bTisqn58a9ghq5E0ESWpEN7b8S4jAFmRTOyzY",
    BASE_URL: "https://api.pexels.com/v1",
  },
} as const

// Helper function to get API headers
export const getAPIHeaders = (service: keyof typeof API_CONFIG) => {
  switch (service) {
    case "UNSPLASH":
      return {
        Authorization: `Client-ID ${API_CONFIG.UNSPLASH.ACCESS_KEY}`,
        "Content-Type": "application/json",
      }
    case "PEXELS":
      return {
        Authorization: API_CONFIG.PEXELS.API_KEY,
        "Content-Type": "application/json",
      }
    default:
      return {}
  }
}
