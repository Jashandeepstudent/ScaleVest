import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post("/api/send-otp", async (req, res) => {
    try {
      const { email, otp } = req.body;
      
      // Proxy request to Resend
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer re_c6WmATF9_ARo1Z2nWaVvrBdb51EYmYn17"
        },
        body: JSON.stringify({
          from: "onboarding@resend.dev",
          to: email,
          subject: "Your ScaleVest Login Code",
          html: `<p>Your verification code is: <strong>${otp}</strong></p>`
        })
      });
      ...
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  return httpServer;
}
