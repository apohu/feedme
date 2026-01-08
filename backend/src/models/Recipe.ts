import { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../config/database';
import { Recipe, RecipeIngredient, Tag } from '../types';

export class RecipeModel {
  static async getAll(): Promise<Recipe[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM recipes ORDER BY created_at DESC'
    );
    return rows as Recipe[];
  }

  static async getById(id: number): Promise<Recipe | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM recipes WHERE id = ?',
      [id]
    );

    if (rows.length === 0) return null;

    const recipe = rows[0] as Recipe;

    // Get ingredients
    recipe.ingredients = await this.getRecipeIngredients(id);

    // Get tags
    recipe.tags = await this.getRecipeTags(id);

    return recipe;
  }

  static async getRecipeIngredients(recipeId: number): Promise<RecipeIngredient[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT ri.*, i.name as ingredient_name, i.nutriscore
       FROM recipe_ingredients ri
       JOIN ingredients i ON ri.ingredient_id = i.id
       WHERE ri.recipe_id = ?`,
      [recipeId]
    );
    return rows as RecipeIngredient[];
  }

  static async getRecipeTags(recipeId: number): Promise<Tag[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT t.*
       FROM recipe_tags rt
       JOIN tags t ON rt.tag_id = t.id
       WHERE rt.recipe_id = ?`,
      [recipeId]
    );
    return rows as Tag[];
  }

  static async create(recipe: Recipe): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO recipes (name, description, instructions, prep_time_minutes,
       cook_time_minutes, servings, estimated_cost, nutriscore, is_external, external_source)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        recipe.name,
        recipe.description,
        recipe.instructions,
        recipe.prep_time_minutes,
        recipe.cook_time_minutes,
        recipe.servings,
        recipe.estimated_cost,
        recipe.nutriscore,
        recipe.is_external,
        recipe.external_source
      ]
    );
    return result.insertId;
  }

  static async update(id: number, recipe: Partial<Recipe>): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE recipes SET
       name = COALESCE(?, name),
       description = COALESCE(?, description),
       instructions = COALESCE(?, instructions),
       prep_time_minutes = COALESCE(?, prep_time_minutes),
       cook_time_minutes = COALESCE(?, cook_time_minutes),
       servings = COALESCE(?, servings),
       estimated_cost = COALESCE(?, estimated_cost),
       nutriscore = COALESCE(?, nutriscore),
       is_external = COALESCE(?, is_external),
       external_source = COALESCE(?, external_source)
       WHERE id = ?`,
      [
        recipe.name,
        recipe.description,
        recipe.instructions,
        recipe.prep_time_minutes,
        recipe.cook_time_minutes,
        recipe.servings,
        recipe.estimated_cost,
        recipe.nutriscore,
        recipe.is_external,
        recipe.external_source,
        id
      ]
    );
    return result.affectedRows > 0;
  }

  static async delete(id: number): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM recipes WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async addIngredient(recipeId: number, ingredientId: number, quantity: number, unit: string): Promise<void> {
    await pool.query(
      'INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit) VALUES (?, ?, ?, ?)',
      [recipeId, ingredientId, quantity, unit]
    );
  }

  static async removeIngredient(recipeId: number, ingredientId: number): Promise<void> {
    await pool.query(
      'DELETE FROM recipe_ingredients WHERE recipe_id = ? AND ingredient_id = ?',
      [recipeId, ingredientId]
    );
  }

  static async addTag(recipeId: number, tagId: number): Promise<void> {
    await pool.query(
      'INSERT INTO recipe_tags (recipe_id, tag_id) VALUES (?, ?)',
      [recipeId, tagId]
    );
  }

  static async removeTag(recipeId: number, tagId: number): Promise<void> {
    await pool.query(
      'DELETE FROM recipe_tags WHERE recipe_id = ? AND tag_id = ?',
      [recipeId, tagId]
    );
  }

  static async searchByCriteria(criteria: {
    tags?: number[];
    maxCost?: number;
    maxPrepTime?: number;
    nutriscore?: string[];
    excludeIngredients?: number[];
  }): Promise<Recipe[]> {
    let query = 'SELECT DISTINCT r.* FROM recipes r';
    const params: any[] = [];
    const conditions: string[] = [];

    if (criteria.tags && criteria.tags.length > 0) {
      query += ' JOIN recipe_tags rt ON r.id = rt.recipe_id';
      conditions.push(`rt.tag_id IN (${criteria.tags.map(() => '?').join(',')})`);
      params.push(...criteria.tags);
    }

    if (criteria.excludeIngredients && criteria.excludeIngredients.length > 0) {
      query += ` AND r.id NOT IN (
        SELECT recipe_id FROM recipe_ingredients
        WHERE ingredient_id IN (${criteria.excludeIngredients.map(() => '?').join(',')})
      )`;
      params.push(...criteria.excludeIngredients);
    }

    // Include NULL values in cost/time filters so recipes without these values aren't excluded
    if (criteria.maxCost) {
      conditions.push('(r.estimated_cost IS NULL OR r.estimated_cost <= ?)');
      params.push(criteria.maxCost);
    }

    if (criteria.maxPrepTime) {
      conditions.push('(r.prep_time_minutes IS NULL OR r.prep_time_minutes <= ?)');
      params.push(criteria.maxPrepTime);
    }

    if (criteria.nutriscore && criteria.nutriscore.length > 0) {
      conditions.push(`r.nutriscore IN (${criteria.nutriscore.map(() => '?').join(',')})`);
      params.push(...criteria.nutriscore);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY r.nutriscore ASC, r.estimated_cost ASC';

    console.log('🔍 SQL Query:', query);
    console.log('🔍 SQL Params:', params);

    const [rows] = await pool.query<RowDataPacket[]>(query, params);
    console.log(`📝 Requête SQL a trouvé ${rows.length} recettes`);
    return rows as Recipe[];
  }
}
