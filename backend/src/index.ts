import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import indexRoutes from './routes/index.routes'

dotenv.config();
const PORT = process.env.PORT || 3000

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', indexRoutes)

app.listen(PORT,() => console.log(`Service running on http://localhost:${PORT}`))

