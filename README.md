# BrowseScope

Local browser history analytics & navigation graph visualizer.

## Run locally

**Backend** (Spring Boot, Java 17+, Maven):
```
cd backend
mvn spring-boot:run
```
Runs on http://localhost:8080

**Frontend** (React + Vite):
```
cd frontend
npm install
npm run dev
```
Runs on http://localhost:5173

Open the frontend, upload a **copy** of your browser's `History` SQLite file
(close the browser first — Chrome locks the live file), and the dashboard,
navigation graph, and searchable history table populate from it.

Default Windows location of the file:
`C:\Users\<you>\AppData\Local\Google\Chrome\User Data\Default\History`

## DevOps pipeline

See `Jenkinsfile` and `ansible/deploy.yml`. Flow:

```
GitHub push → Jenkins webhook → Maven build (backend/) → archive jar
            → Ansible deploy to target node
```
