import { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../config/database';
import { Tag, TagCategory } from '../types';

export class TagModel {
  static async getAll(): Promise<Tag[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM tags ORDER BY category, name ASC'
    );
    return rows as Tag[];
  }

  static async getById(id: number): Promise<Tag | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM tags WHERE id = ?',
      [id]
    );
    return rows.length > 0 ? (rows[0] as Tag) : null;
  }

  static async getByCategory(category: TagCategory): Promise<Tag[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM tags WHERE category = ? ORDER BY name ASC',
      [category]
    );
    return rows as Tag[];
  }

  static async create(tag: Tag): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO tags (name, category, description) VALUES (?, ?, ?)',
      [tag.name, tag.category, tag.description]
    );
    return result.insertId;
  }

  static async update(id: number, tag: Partial<Tag>): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE tags SET
       name = COALESCE(?, name),
       category = COALESCE(?, category),
       description = COALESCE(?, description)
       WHERE id = ?`,
      [tag.name, tag.category, tag.description, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id: number): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM tags WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}
