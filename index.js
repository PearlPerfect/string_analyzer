import express from 'express';
import stringRoutes from './src/routes/strings.js';
import storage from './src/services/storage.js';   
import path from 'path';                            
const app = express();
app.use(express.json());

// Initialize DB
const dbPath = path.resolve('./data/strings.db');   
await storage.init(dbPath);                       

app.use('/strings', stringRoutes);

const PORT = process.env.PORT || 3000;

// Basic logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
});

app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
