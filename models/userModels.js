import pool from '../db.js';


const saltRounds = 12;

class UserModel {
    // Fetch all users
    static async getAll() {
        try {
            const result = await pool.query('SELECT * FROM users');
            return result.rows;
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    }

    // Add a new user
    static async addUser(id, name, email, password) {
        try {
            const checkExist = await this.checkExist(email);

            if (!checkExist) {
                const result = await pool.query(
                    'INSERT INTO users (id, name, email, password) VALUES ($1, $2, $3, $4) RETURNING *',
                    [id, name, email, password]
                );
                return result.rows[0];
            } else {
                console.log('User already exists');
                return null;
            }
        } catch (error) {
            console.error('Error adding user:', error);
            throw error;
        }
    }

    // Check if the user is logged in
    static async isLogged(req) {
        try {
            return req.isAuthenticated();
        } catch (error) {
            console.error('Error checking login status:', error);
            throw error;
        }
    }
    //check existing users
    static async checkExist(email) {
        try {
            const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
            return result.rows.length > 0;
        } catch (error) {
            console.error('Error checking if user exists:', error);
            throw error;
        }
    }

}

export default UserModel;