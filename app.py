from flask import Flask, render_template, request, redirect, url_for, jsonify, Response
from flask_mysqldb import MySQL
import MySQLdb.cursors

app = Flask(__name__)

app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'Cavaler19'
app.config['MYSQL_DB'] = 'ConstructionManagement'

mysql = MySQL(app)

@app.route('/')
def index():
    return render_template('home.html')

@app.route('/home')
def home():
    return render_template('home.html')

@app.route('/api/dashboard_data')
def dashboard_data():
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    
    try:
        # Get Total Builders
        cursor.execute('SELECT COUNT(*) AS total_builders FROM Builders')
        total_builders = cursor.fetchone()['total_builders']
        
        # Get Total Projects
        cursor.execute('SELECT COUNT(*) AS total_projects FROM Projects_Builders')
        total_projects = cursor.fetchone()['total_projects']
        
        # Get Total Profit (adjust the query based on your schema)
        cursor.execute('SELECT SUM(Project_Budget) AS total_profit FROM Projects_Builders')
        total_profit = cursor.fetchone()['total_profit'] or 0  # Default to 0 if None
        
        print(f"Total Profit: {total_profit}")

        # Get Average Monthly Salary (assuming Salary is annual)
        cursor.execute('SELECT AVG(Salary) AS avg_salary FROM Builders')
        avg_salary = cursor.fetchone()['avg_salary'] or 0  # Default to 0 if None
        avg_monthly_salary = avg_salary  # Convert to monthly salary
        
    except Exception as e:
        print(f"Error occurred while fetching data: {e}")
        total_builders = total_projects = total_profit = avg_monthly_salary = 0
    finally:
        cursor.close()

    return jsonify({
        "total_builders": total_builders,
        "total_projects": total_projects,
        "total_profit": total_profit,
        "avg_monthly_wage": avg_monthly_salary
    })


@app.route('/api/recent_projects')
def recent_projects():
    try:
        # Create a cursor to interact with the database
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        
        # Execute the query to get recent projects
        cursor.execute('''
            SELECT pb.Project_ID, c.First_Name AS client_first_name, c.Last_Name AS client_last_name,
                   b.First_Name AS builder_first_name, b.Last_Name AS builder_last_name,
                   pb.Start_Date, pb.Project_Status, pb.Project_Budget
            FROM Projects_Builders pb
            JOIN Clients c ON pb.Client_ID = c.Client_ID
            JOIN Builders b ON pb.Builder_ID = b.Builder_ID
            ORDER BY pb.Start_Date DESC
            LIMIT 10
        ''')
        
        # Fetch the results of the query
        projects = cursor.fetchall()

        # Close the cursor after the operation is complete
        cursor.close()

        # Return the results as a JSON response
        return jsonify(projects)

    except Exception as e:
        # Handle errors (e.g., database connection issues)
        return jsonify({"error": str(e)}), 500

@app.route('/api/recent_builders')
def recent_builders():
    try:
        # Establish database connection
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        
        # Execute the query to fetch recent builders
        cursor.execute('''
            SELECT b.First_Name AS builder_first_name, b.Last_Name AS builder_last_name, b.Experience_Years
            FROM Builders b
            ORDER BY b.Experience_Years DESC
            LIMIT 10
        ''')
        
        # Fetch the results
        builders = cursor.fetchall()
        
        # Close the cursor
        cursor.close()

        # Return the results as JSON
        return jsonify(builders)
    
    except MySQLdb.DatabaseError as db_error:
        # Handle database-specific errors (e.g., connection failure, query issues)
        print(f"Database error: {db_error}")
        return jsonify({"error": "Database error occurred. Please try again later."}), 500
    
    except Exception as e:
        # Handle any unexpected errors
        print(f"An error occurred: {e}")
        return jsonify({"error": "An unexpected error occurred. Please try again later."}), 500

@app.route('/clients')
def clients():
    return render_template('clients.html')

@app.route('/go-add-client')
def go_add_client():
    return render_template('add_client.html')

#add a new client

@app.route('/add_client', methods=['POST'])
def add_client():
    data = request.get_json()

    first_name = data['first_name']
    last_name = data['last_name']
    phone = data.get('phone', None)  # Optional field
    email = data.get('email', None)  # Optional field
    address = data.get('address', None)  # Optional field
    client_type = data['client_type']
    birth_date = data.get('birth_date', None)  # Optional field
    number_of_projects = data['number_of_projects']

    # Create cursor
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)

    # Insert client into the database
    try:
        query = """
        INSERT INTO Clients (First_Name, Last_Name, Phone, Email, Address, Registration_Date, Client_Type, Birth_Date, Number_of_Projects)
        VALUES (%s, %s, %s, %s, %s, CURDATE(), %s, %s, %s)
        """
        cursor.execute(query, (first_name, last_name, phone, email, address, client_type, birth_date, number_of_projects))

        # Commit changes
        mysql.connection.commit()
        cursor.close()

        return jsonify({'success': True})
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/get-clients', methods=['GET'])
def get_clients():
    try:
        cursor = mysql.connection.cursor()
        cursor.execute("SELECT * FROM Clients")
        rows = cursor.fetchall()

        if not rows:
            return jsonify({'error': 'No clients found'}), 404

        clients = []
        for row in rows:
            client = {
                'id': row[0],
                'first_name': row[1],
                'last_name': row[2],
                'phone_number': row[3],
                'email': row[4],
                'address': row[5],
                'registration_date': row[6],
                'client_type': row[7],
                'birth_date': row[8],
                'number_of_projects': row[9]
            }
            clients.append(client)

        return jsonify(clients)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Route to delete a client
@app.route('/api/delete-client/<int:id>', methods=['DELETE'])
def delete_client(id):
    try:
        cursor = mysql.connection.cursor()
        cursor.execute("SELECT * FROM Clients WHERE Client_ID = %s", (id,))
        client = cursor.fetchone()

        if not client:
            return jsonify({'error': 'Client not found'}), 404

        cursor.execute("DELETE FROM Clients WHERE Client_ID = %s", (id,))
        mysql.connection.commit()
        return jsonify({'message': 'Client deleted successfully!'})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Route to update client data
@app.route('/api/update-client', methods=['POST'])
def update_client():
    # Get the updated client data from the request
    data = request.get_json()

    client_id = data.get('id')
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    phone_number = data.get('phone_number')
    email = data.get('email')
    address = data.get('address')

    # Create a MySQL connection and cursor
    cursor = mysql.connection.cursor()

    try:
        # Prepare the SQL query to update the client
        query = """
        UPDATE clients
        SET first_name = %s, last_name = %s, phone = %s, email = %s, address = %s
        WHERE Client_ID = %s
        """
        cursor.execute(query, (first_name, last_name, phone_number, email, address, client_id))

        # Commit the changes to the database
        mysql.connection.commit()

        # Return success response
        return jsonify({"message": "success"})

    except Exception as e:
        # Rollback in case of error
        mysql.connection.rollback()
        print(f"Error updating client: {e}")
        return jsonify({"message": "failure"}), 500

    finally:
        cursor.close()

@app.route('/builders')
def builders():
    return render_template('builders.html')

@app.route('/go-add-builder')
def go_add_builder():
    return render_template('add_builder.html')

#add a new builder

@app.route('/api/add-builder', methods=['POST'])
def add_builder():
    try:
        # Parse the JSON request
        data = request.get_json()
        first_name = data.get('first_name')
        last_name = data.get('last_name')
        specialization = data.get('specialization')
        phone = data.get('phone')
        email = data.get('email')
        address = data.get('address')
        hiring_date = data.get('hiring_date')
        experience_years = data.get('experience_years')
        salary = data.get('salary')

        # Validate required fields
        if not all([first_name, last_name, phone, email, address, hiring_date, experience_years, salary]):
            return jsonify({'message': 'error', 'details': 'All fields are required'}), 400

        # Insert data into the Builders table
        cursor = mysql.connection.cursor()
        query = """
            INSERT INTO Builders (First_Name, Last_Name, Specialization, Phone, Email, Address, Hiring_Date, Experience_Years, Salary)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query, (first_name, last_name, specialization, phone, email, address, hiring_date, experience_years, salary))
        mysql.connection.commit()
        cursor.close()

        return jsonify({'message': 'success'})
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'message': 'error', 'details': str(e)}), 500

@app.route('/api/get-builders', methods=['GET'])
def get_builders():
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute("SELECT * FROM Builders")
    builders = cursor.fetchall()
    return jsonify(builders)

# Delete builder by ID
@app.route('/api/delete-builder/<int:id>', methods=['DELETE'])
def delete_builder(id):
    cursor = mysql.connection.cursor()
    try:
        cursor.execute("DELETE FROM Builders WHERE Builder_ID = %s", (id,))
        mysql.connection.commit()
        return jsonify({"message": "success"})
    except Exception as e:
        mysql.connection.rollback()
        return jsonify({"message": "failure", "error": str(e)}), 500
    finally:
        cursor.close()

#update builder
 
@app.route('/api/update-builder', methods=['POST'])
def update_builder():
    # Get the updated builder data from the request
    data = request.get_json()

    builder_id = data.get('id')
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    phone = data.get('phone')
    email = data.get('email')
    address = data.get('address')
    salary = data.get('salary')
    specialization = data.get('specialization')

    # Ensure that the required fields are provided
    if not all([builder_id, first_name, last_name, phone, email, address, salary]):
        return jsonify({"message": "failure", "error": "All fields (except ID) are required"}), 400

    cursor = mysql.connection.cursor()

    try:
        # SQL query to update builder data
        query = """
        UPDATE Builders
        SET First_Name = %s, Last_Name = %s, Phone = %s, Email = %s, 
            Address = %s, Salary = %s, Specialization = %s
        WHERE Builder_ID = %s
        """
        cursor.execute(query, (first_name, last_name, phone, email, address, salary, specialization, builder_id))

        # Commit changes to the database
        mysql.connection.commit()

        # If no rows are updated, return a message indicating that the builder was not found
        if cursor.rowcount == 0:
            return jsonify({"message": "failure", "error": "Builder not found"}), 404

        return jsonify({"message": "success"})

    except Exception as e:
        # Rollback in case of error
        mysql.connection.rollback()
        print(f"Error updating builder: {e}")
        return jsonify({"message": "failure", "error": str(e)}), 500

    finally:
        cursor.close()

# Get a specific builder by ID
@app.route('/api/get-builder/<int:id>', methods=['GET'])
def get_builder(id):
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    try:
        cursor.execute("SELECT * FROM Builders WHERE Builder_ID = %s", (id,))
        builder = cursor.fetchone()  # Fetch a single builder
        if builder:
            return jsonify(builder)
        else:
            return jsonify({"message": "Builder not found"}), 404
    except Exception as e:
        return jsonify({"message": "failure", "error": str(e)}), 500
    finally:
        cursor.close()

@app.route('/projects')
def projects():
    return render_template('projects.html')

@app.route('/go-add-project')
def go_add_project():
    return render_template('add_project.html')

@app.route('/add_project', methods=['POST'])
def add_project():
    data = request.get_json()

    client_first_name = data['client_first_name']
    client_last_name = data['client_last_name']
    builder_first_name = data['builder_first_name']
    builder_last_name = data['builder_last_name']
    start_date = data['start_date']
    project_status = data['project_status']
    project_budget = data['project_budget']

    # Create cursor
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)

    # Find the Client_ID based on client name
    cursor.execute("SELECT Client_ID FROM Clients WHERE First_Name=%s AND Last_Name=%s", (client_first_name, client_last_name))
    client = cursor.fetchone()
    if not client:
        return jsonify({'success': False, 'error': 'Client not found'})

    # Find the Builder_ID based on builder name
    cursor.execute("SELECT Builder_ID FROM Builders WHERE First_Name=%s AND Last_Name=%s", (builder_first_name, builder_last_name))
    builder = cursor.fetchone()
    if not builder:
        return jsonify({'success': False, 'error': 'Builder not found'})

    client_id = client['Client_ID']
    builder_id = builder['Builder_ID']

    # Insert project into the Projects_Builders table
    try:
        query = """
        INSERT INTO Projects_Builders (Client_ID, Builder_ID, Start_Date, Project_Status, Project_Budget)
        VALUES (%s, %s, %s, %s, %s)
        """
        cursor.execute(query, (client_id, builder_id, start_date, project_status, project_budget))

        # Commit changes
        mysql.connection.commit()
        cursor.close()

        return jsonify({'success': True})
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/get-projects', methods=['GET'])
def get_projects():
    try:
        cursor = mysql.connection.cursor()
        query = """
        SELECT 
            pb.Project_ID,
            pb.Client_ID,
            pb.Builder_ID,
            c.First_Name AS Client_First_Name,
            c.Last_Name AS Client_Last_Name,
            b.First_Name AS Builder_First_Name,
            b.Last_Name AS Builder_Last_Name,
            pb.Start_Date,
            pb.Project_Status,
            pb.Project_Budget
        FROM Projects_Builders pb
        JOIN Clients c ON pb.Client_ID = c.Client_ID
        JOIN Builders b ON pb.Builder_ID = b.Builder_ID
        """
        cursor.execute(query)
        projects = cursor.fetchall()

        # Convert data to JSON format
        project_list = [
            {
                'Project_ID': project[0],
                'Client_ID': project[1],  # Include Client_ID
                'Builder_ID': project[2],  # Include Builder_ID
                'Client_Name': f"{project[3]} {project[4]}",  # Concatenate First Name and Last Name for Client
                'Builder_Name': f"{project[5]} {project[6]}",  # Concatenate First Name and Last Name for Builder
                'Start_Date': project[7],
                'Project_Status': project[8],
                'Project_Budget': float(project[9]),  # Convert Project_Budget to float
            }
            for project in projects
        ]
        return jsonify(project_list)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# API to delete a project
@app.route('/api/delete-project/<int:project_id>', methods=['DELETE'])
def delete_project(project_id):
    try:
        cursor = mysql.connection.cursor()
        query = "DELETE FROM Projects_Builders WHERE Project_ID = %s"
        cursor.execute(query, (project_id,))
        mysql.connection.commit()
        return jsonify({'message': 'success'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/update-project', methods=['POST'])
def update_project():
    data = request.get_json()  # Parse the incoming JSON data
    print(f"Received data: {data}")  # Log the received data

    # Check if all necessary fields are present
    required_fields = ['Project_ID', 'Client_ID', 'Builder_ID', 'Start_Date', 'Project_Status', 'Project_Budget']
    for field in required_fields:
        if field not in data:
            print(f"Missing field: {field}")  # Log missing field
            return jsonify({'success': False, 'error': f"'{field}' is required"}), 400

    # Extract the data
    project_id = data['Project_ID']
    client_id = data['Client_ID']
    builder_id = data['Builder_ID']
    start_date = data['Start_Date']
    project_status = data['Project_Status']
    project_budget = data['Project_Budget']

    # Get a cursor to interact with the database
    cursor = mysql.connection.cursor()

    try:
        # Check if the Client_ID exists
        cursor.execute("SELECT Client_ID FROM Clients WHERE Client_ID = %s", (client_id,))
        client = cursor.fetchone()
        if not client:
            print(f"Client not found: {client_id}")  # Log if client not found
            return jsonify({'success': False, 'error': 'Client not found'}), 404

        # Check if the Builder_ID exists
        cursor.execute("SELECT Builder_ID FROM Builders WHERE Builder_ID = %s", (builder_id,))
        builder = cursor.fetchone()
        if not builder:
            print(f"Builder not found: {builder_id}")  # Log if builder not found
            return jsonify({'success': False, 'error': 'Builder not found'}), 404

        # Update the project in the Projects_Builders table
        query = """
        UPDATE Projects_Builders
        SET Client_ID = %s, Builder_ID = %s, Start_Date = %s, Project_Status = %s, Project_Budget = %s
        WHERE Project_ID = %s
        """
        cursor.execute(query, (client_id, builder_id, start_date, project_status, project_budget, project_id))
        print(f"Rows affected: {cursor.rowcount}")  # Log how many rows were affected

        if cursor.rowcount == 0:
            print(f"No project found with Project_ID {project_id}")  # Log if no rows were updated
            return jsonify({'success': False, 'error': 'No matching project found'}), 404

        # Commit the changes to the database
        mysql.connection.commit()
        cursor.close()

        return jsonify({'success': True, 'message': 'Project data updated successfully'})

    except Exception as e:
        # Log the error (useful for debugging)
        print(f"Error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)

for rule in app.url_map.iter_rules():
    print(rule.endpoint)