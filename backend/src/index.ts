import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';
import pool from './config/database';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Bienvenue sur FeedMe API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      recipes: '/api/recipes',
      ingredients: '/api/ingredients',
      tags: '/api/tags',
      menus: '/api/menus',
      calendar: '/api/calendar'
    }
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint non trouvé' });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Erreur interne du serveur',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Test database connection and start server
const startServer = async () => {
  try {
    // Test database connection
    const connection = await pool.getConnection();
    console.log('✓ Connexion à la base de données réussie');
    connection.release();

    // Start server
    app.listen(PORT, () => {
      console.log(`✓ Serveur démarré sur le port ${PORT}`);
      console.log(`✓ API disponible sur http://localhost:${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('✗ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
};

startServer();

export default app;
