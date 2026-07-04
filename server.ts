import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Lazy initialization of Gemini client to prevent crashing if the key is missing on startup
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set. Please add it in the Secrets panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

const app = express();
const PORT = 3000;

app.use(express.json());

// API: Generate Career Roadmap
app.post("/api/roadmap/generate", async (req, res) => {
  try {
    const { input } = req.body;
    if (!input || !input.targetGoal) {
      res.status(400).json({ error: "Missing target goal in request." });
      return;
    }

    const ai = getGeminiClient();

    const prompt = `You are a world-class executive career coach and technical recruiter.
Create a highly personalized, deeply structured Career Roadmap and Skill Gap Analysis based on the following user profile:

- Target Career Goal: ${input.targetGoal}
- Current Role/Background: ${input.currentRole || "None specified"}
- Existing Skills & Tools: ${input.existingSkills ? input.existingSkills.join(", ") : "None specified"}
- Current Overall Level: ${input.experienceLevel || "Beginner"}
- Time Commitment Available: ${input.timeCommitment || "Flexible"}
- Preferred Learning Style: ${input.learningStyle || "mixed"}
- Specialization/Interest: ${input.industrySpecialization || "None specified"}

Generate detailed, customized, and practical guidance. Avoid generic text.

Specifically, map:
1. Career Goal Identified: An insightful analysis of why this career goal is relevant, its general outlook, and strategic guidance on how to bridge the gap from their current background.
2. Recommended Career Roles: 3 specific, real-world roles aligned with this goal.
3. Skill Gap Analysis:
   - Existing Skills: Explicitly mapping how their existing skills help them, providing constructive relevance.
   - Missing Skills: A precise list of high, medium, or low priority skills they must acquire, with descriptions of why they are needed.
4. Learning Roadmap split into 3 logical levels:
   - Beginner Phase: Foundation skills, detailed concepts to learn, estimated weeks, and highly specific courses/resource recommendations.
   - Intermediate Phase: Next-level skills, concepts, estimated weeks, and resource recommendations.
   - Advanced Phase: Advanced/specialized skills, concepts, estimated weeks, and resource recommendations.
   (Generate logical task IDs such as 'task-beg-1', 'task-int-2', etc.)
5. Recommended Projects: 3 high-impact, portfolio-worthy project scopes matching their level. Include descriptive project IDs (e.g., 'proj-1'), precise tech stacks, list of key features, and a step-by-step implementation guide for each.
6. Certifications & Tools:
   - Certifications: 2-3 genuine industry-recognized certifications with issuers and brief descriptions.
   - Tools: A list of 4-5 software tools/frameworks/platforms to master.
7. Next Action Plan (30–60–90 Days):
   - Specific, actionable steps with timeframe tags ('30-days', '60-days', '90-days') to get them off to a flying start immediately. Generate IDs like 'act-30-1', 'act-60-2'.

IMPORTANT: Ensure all resources and recommendations are modern and realistic for 2026. Return strictly valid JSON that conforms exactly to the specified JSON schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            careerGoalAnalysis: {
              type: Type.STRING,
              description: "A comprehensive analysis of the identified career goal, the alignment with their existing background, and transition strategy."
            },
            recommendedRoles: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  roleTitle: { type: Type.STRING },
                  description: { type: Type.STRING },
                  salaryRange: { type: Type.STRING, description: "e.g., '$85,000 - $120,000/yr'" },
                  demandLevel: { type: Type.STRING, description: "High, Medium, or Steady" }
                },
                required: ["roleTitle", "description", "demandLevel"]
              }
            },
            skillGapAnalysis: {
              type: Type.OBJECT,
              properties: {
                existingSkillsMapping: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      skill: { type: Type.STRING },
                      relevance: { type: Type.STRING, description: "Specific detail on how this existing skill directly transfers or aids the target goal." }
                    },
                    required: ["skill", "relevance"]
                  }
                },
                missingSkillsGap: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      skill: { type: Type.STRING },
                      priority: { type: Type.STRING, description: "High, Medium, or Low" },
                      description: { type: Type.STRING, description: "Why they need this skill, what concepts to learn, or why it is a gap." }
                    },
                    required: ["skill", "priority", "description"]
                  }
                }
              },
              required: ["existingSkillsMapping", "missingSkillsGap"]
            },
            phases: {
              type: Type.OBJECT,
              properties: {
                beginner: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING, description: "e.g. 'Phase 1: Foundations'" },
                    description: { type: Type.STRING },
                    tasks: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          id: { type: Type.STRING, description: "e.g., 'task-beg-1'" },
                          title: { type: Type.STRING },
                          description: { type: Type.STRING },
                          estimatedWeeks: { type: Type.INTEGER },
                          concepts: { type: Type.ARRAY, items: { type: Type.STRING } },
                          resources: {
                            type: Type.ARRAY,
                            items: {
                              type: Type.OBJECT,
                              properties: {
                                title: { type: Type.STRING, description: "e.g., 'Learn Python the Hard Way', 'MDN Web Docs'" },
                                type: { type: Type.STRING, description: "video, article, book, interactive, or course" }
                              },
                              required: ["title", "type"]
                            }
                          }
                        },
                        required: ["id", "title", "description", "estimatedWeeks", "concepts", "resources"]
                      }
                    }
                  },
                  required: ["title", "description", "tasks"]
                },
                intermediate: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING, description: "e.g. 'Phase 2: Building Core Proficiency'" },
                    description: { type: Type.STRING },
                    tasks: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          id: { type: Type.STRING, description: "e.g., 'task-int-1'" },
                          title: { type: Type.STRING },
                          description: { type: Type.STRING },
                          estimatedWeeks: { type: Type.INTEGER },
                          concepts: { type: Type.ARRAY, items: { type: Type.STRING } },
                          resources: {
                            type: Type.ARRAY,
                            items: {
                              type: Type.OBJECT,
                              properties: {
                                title: { type: Type.STRING },
                                type: { type: Type.STRING }
                              },
                              required: ["title", "type"]
                            }
                          }
                        },
                        required: ["id", "title", "description", "estimatedWeeks", "concepts", "resources"]
                      }
                    }
                  },
                  required: ["title", "description", "tasks"]
                },
                advanced: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING, description: "e.g. 'Phase 3: Mastering Advanced Systems'" },
                    description: { type: Type.STRING },
                    tasks: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          id: { type: Type.STRING, description: "e.g., 'task-adv-1'" },
                          title: { type: Type.STRING },
                          description: { type: Type.STRING },
                          estimatedWeeks: { type: Type.INTEGER },
                          concepts: { type: Type.ARRAY, items: { type: Type.STRING } },
                          resources: {
                            type: Type.ARRAY,
                            items: {
                              type: Type.OBJECT,
                              properties: {
                                title: { type: Type.STRING },
                                type: { type: Type.STRING }
                              },
                              required: ["title", "type"]
                            }
                          }
                        },
                        required: ["id", "title", "description", "estimatedWeeks", "concepts", "resources"]
                      }
                    }
                  },
                  required: ["title", "description", "tasks"]
                }
              },
              required: ["beginner", "intermediate", "advanced"]
            },
            recommendedProjects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: "e.g., 'proj-1'" },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  difficulty: { type: Type.STRING, description: "Beginner, Intermediate, or Advanced" },
                  techStack: { type: Type.ARRAY, items: { type: Type.STRING } },
                  keyFeatures: { type: Type.ARRAY, items: { type: Type.STRING } },
                  stepByStepGuide: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["id", "title", "description", "difficulty", "techStack", "keyFeatures", "stepByStepGuide"]
              }
            },
            certificationsAndTools: {
              type: Type.OBJECT,
              properties: {
                certifications: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      issuer: { type: Type.STRING },
                      description: { type: Type.STRING }
                    },
                    required: ["name", "issuer", "description"]
                  }
                },
                tools: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      purpose: { type: Type.STRING }
                    },
                    required: ["name", "purpose"]
                  }
                }
              },
              required: ["certifications", "tools"]
            },
            nextActionPlan: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: "e.g., 'act-30-1', 'act-60-1'" },
                  title: { type: Type.STRING },
                  timeframe: { type: Type.STRING, description: "30-days, 60-days, or 90-days" },
                  description: { type: Type.STRING }
                },
                required: ["id", "title", "timeframe", "description"]
              }
            }
          },
          required: [
            "careerGoalAnalysis",
            "recommendedRoles",
            "skillGapAnalysis",
            "phases",
            "recommendedProjects",
            "certificationsAndTools",
            "nextActionPlan"
          ]
        },
      },
    });

    const roadmapData = JSON.parse(response.text || "{}");
    res.json(roadmapData);
  } catch (error: any) {
    console.error("Roadmap generation error:", error);
    res.status(500).json({ error: error.message || "An error occurred during roadmap generation." });
  }
});

// API: Career Coach chat
app.post("/api/roadmap/chat", async (req, res) => {
  try {
    const { roadmap, messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: "Messages array is required." });
      return;
    }

    const ai = getGeminiClient();

    // Construct the context
    let context = "You are a professional, motivating, and highly knowledgeable Career Coach.\n";
    if (roadmap) {
      context += `The user is currently consulting you about their generated Career Roadmap for the goal: "${roadmap.title}".
Background context:
- Current role: ${roadmap.input.currentRole || "Not specified"}
- Experience level: ${roadmap.input.experienceLevel}
- Learning style: ${roadmap.input.learningStyle}
- Career Goal Identified Summary: ${roadmap.careerGoalAnalysis}
- Skill Gap Analysis (Existing Skills): ${roadmap.skillGapAnalysis.existingSkillsMapping.map((s: any) => s.skill).join(", ")}
- Skill Gap Analysis (Missing Skills): ${roadmap.skillGapAnalysis.missingSkillsGap.map((s: any) => s.skill).join(", ")}
- Recommended Projects: ${roadmap.recommendedProjects.map((p: any) => p.title).join(", ")}
`;
    }

    context += `\nAnswer the user's career and skill questions with actionable, helpful, and highly targeted advice. Keep it educational, practical, and positive. You can refer specifically to their roadmap phases or projects when appropriate. Ensure formatting is clean, readable, and structured.`;

    // Map messages for Gemini
    const geminiContents = messages.map((m: any) => ({
      role: m.sender === "user" ? "user" : "model",
      parts: [{ text: m.text }],
    }));

    // Generate content
    const chatResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: geminiContents,
      config: {
        systemInstruction: context,
      },
    });

    res.json({ text: chatResponse.text });
  } catch (error: any) {
    console.error("Career chat error:", error);
    res.status(500).json({ error: error.message || "An error occurred during the career coach chat." });
  }
});

// Vite Middleware for Full Stack
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
