# ContextAI - Hybrid Serverless RAG System

**A production-grade, secure Document Intelligence platform built on AWS.**  
ContextAI uses a hybrid architecture combining the cost-efficiency of **Serverless (Lambda)** with the computational power of **EC2** to deliver a "NotebookLM-style" research experience.

---

## 📌 The Problem
In a world drowning in digital documents, finding specific information is becoming impossible.
*   **Information Overload**: Professionals spend hours reading through lengthy PDF reports, legal contracts, and research papers just to find one specific answer.
*   **Search Limitations**: Traditional "Ctrl+F" keyword search is dumb. It finds words, but it doesn't understand *context*, *nuance*, or *intent*. Usefulness stops at exact matches.
*   **Lack of Synthesis**: You can't ask a PDF viewer to "compare the risks in these three documents" or "summarize the key findings." 

People need a way to **have a conversation with their documents**—filtering out the noise and getting straight to the insights.

## 💡 The Solution: Hybrid Architecture
ContextAI solves this by splitting the workload:
*   **Orchestration Layer (Serverless)**: Handles lightweight tasks like API Routing, Authentication, and File Uploads. It scales to zero and costs nothing when idle.
*   **Compute Layer (EC2 Worker)**: A dedicated, always-on Docker container that handles heavy lifting—PDF Parsing, Vector Embedding, and LLM Inference.

This approach gives us the best of both worlds: **Fast API responses** and **Unlimited Compute Power** for AI.

---

## 🏗️ Architecture

### 1. The Gateway (Serverless)
*   **AWS Lambda**:
    *   `upload`: Generates secure S3 Presigned URLs for file uploads.
    *   `triggerEC2`: Listens to S3 Events and notifies the worker when a new file arrives.
    *   `chatProxy`: Proxies user questions to the EC2 worker while handling security/validation.
    *   `health`: Simple uptime check.
*   **Amazon S3**: Stores raw PDF kinds of literature.
*   **Amazon API Gateway**: Exposes secure HTTP endpoints.

### 2. The Worker (EC2 + Docker)
*   **Express.js/TypeScript**: Long-running process.
*   **Groq (Llama 3 70B)**: The "Brain" for high-speed, high-intelligence responses.
*   **Vector Store**: In-memory semantic search engine (simulated for speed, replaceable with FAISS/PGVector).
*   **PDF Pipeline**: `pdf-parse` + `LangChain` recursive text splitting (1200 char chunks).

### 3. CI/CD Operations
*   **GitHub Actions**:
    *   **Jobs**:
        1.  `Deploy Serverless`: Deploys Lambda/API Gateway via Serverless Framework.
        2.  `Deploy Worker`: Builds Docker image, pushes to **Amazon ECR**, and updates the **EC2** instance via **SSH**.
*   **Security**: IAM Roles with Least Privilege, Security Groups for traffic isolation.

---

## ✨ Features
*   **NotebookLM Interface**: Clean, dark-mode UI with a retractable sidebar and "Deep Research" aesthetic.
*   **Multi-Document Intelligence**: Upload multiple PDFs and toggle them active/inactive to control the AI's context.
*   **Deep Reasoning**: Uses **Llama 3 70B** with an 8,000 token output limit to write structured reports.
*   **Structured Outputs**: Returns rich Markdown (Tables, Lists, Headers).
*   **Auto-Ingestion**: Files uploaded to S3 are automatically processed and ready for chat in seconds.

---

## 🚀 Deployment Steps

### Prerequisites
*   AWS Account & CLI configured.
*   Node.js v20+.
*   GitHub Repository.

### 1. Set Up GitHub Secrets
Go to `Settings -> Secrets -> Actions` and add:
| Secret | Description |
|:---|:---|
| `AWS_ACCESS_KEY_ID` | IAM User Key (Admin or scoped). |
| `AWS_SECRET_ACCESS_KEY` | IAM Secret Key. |
| `GROQ_API_KEY` | Key from console.groq.com. |
| `EC2_HOST` | Public IP of your EC2 Ubuntu Instance. |
| `SSH_PRIVATE_KEY_EC2` | The content of your `.pem` key. |
| `ECR_REPO` | Name of your ECR Repo (e.g., `ai-worker`). |
| `EC2_API_URL` | `http://<EC2_HOST>:3000` |

### 2. Deploy
Simply push to the `main` branch.
```bash
git push origin main
```
The **CI/CD Pipeline** will:
1.  Deploy the Lambda stack.
2.  Build the Docker Container.
3.  SSH into EC2, pull the new image, and restart the worker.

### 3. Access
Open the URL provided by the `deploy-serverless` job output (e.g., `https://xyz.execute-api.us-east-1.amazonaws.com/prod/`).

---

## 🛠️ Local Development

### Run Client & Proxies
```bash
# Serves UI at http://localhost:4000
npx serverless offline start --httpPort 4000 --param="EC2_API_URL=http://localhost:3000"
```

### Run Worker
```bash
cd worker
npm run dev
# Running on http://localhost:3000
```
*(Ensure you have a `.env` in `worker/` with `GROQ_API_KEY`).*

---

## 🔒 Security
*   **IAM Roles**: Lambdas only have permission to write to specific S3 buckets/Log groups.
*   **Private Worker**: The EC2 worker is unreachable from the public internet (except via the specific API port allowed in Security Groups).
*   **Ephemeral Tokens**: Uploads use short-lived Presigned URLs.

---

### Technologies
*   **Cloud**: AWS (Lambda, S3, EC2, ECR, IAM, API Gateway).
*   **AI**: Groq API (Llama 3.3 70B Versatile / Compound-Mini).
*   **Runtime**: Node.js, TypeScript, Docker.
*   **Framework**: Serverless Framework V3.

**Project by Aakash JS**
