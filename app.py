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

# @app.route('/api/dashboard_data')
# def dashboard_data():
#     cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        
   
#     cursor.execute('SELECT COUNT(*) AS total_patients FROM Patients')
#     total_patients = cursor.fetchone()['total_patients']
        
   
#     cursor.execute('SELECT COUNT(*) AS total_medicines FROM Medicines')
#     total_medicines = cursor.fetchone()['total_medicines']
    
   
#     cursor.execute('SELECT SUM(pm.quantity * m.price) as total_sales FROM Patients_medicines pm, Medicines m WHERE pm.id_medicine = m.id')
#     total_sales = cursor.fetchone()['total_sales']
    

#     cursor.execute('SELECT COUNT(*) AS out_of_stock FROM Medicines WHERE quantity = 0')
#     out_of_stock = cursor.fetchone()['out_of_stock']
    

#     cursor.close()

#     return jsonify({
#         "total_patients": total_patients,
#         "total_medicines": total_medicines,
#         "total_sales": total_sales,
#         "out_of_stock": out_of_stock or 0
#     })

# @app.route('/api/expiring_medicines')
# def expiring_medicines():
#     cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
#     cursor.execute('''
#         SELECT name, expiration_date, quantity
#         FROM Medicines
#         WHERE expiration_date <= DATE_ADD(CURDATE(), INTERVAL 3 MONTH)
#         ORDER BY expiration_date ASC
#     ''')
#     medicines = cursor.fetchall()
#     cursor.close()
#     return jsonify(medicines)


# @app.route('/api/get_monthly_income')
# def get_monthly_income():
#     cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)

#     cursor.execute("""
#     SELECT 
#         DATE_FORMAT(pm.sale_date, '%Y-%m') AS month,  -- Format the date as 'Year-Month'
#         SUM(m.price * pm.quantity) AS total_income
#     FROM 
#         Patients_medicines pm
#     JOIN 
#         Medicines m ON pm.id_medicine = m.id
#     JOIN 
#         Patients p ON pm.id_patient = p.id
#     WHERE 
#         pm.sale_date >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 11 MONTH), '%Y-%m-01')
#     GROUP BY 
#         month
#     ORDER BY 
#         month DESC;
#     """)

#     result = cursor.fetchall()
    
#     months = [row['month'] for row in result]  
#     income = [row['total_income'] for row in result]  

#     cursor.close()

#     return jsonify({
#         'months': months,
#         'income': income
#     })


# @app.route('/api/recent_sales')
# def recent_sales():
#     cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
#     cursor.execute('''
#         SELECT p.name AS patient_name, m.name AS medicine_name, pm.sale_date, pm.quantity, m.price * pm.quantity AS total_price
#         FROM Patients_medicines pm
#         JOIN Patients p ON pm.id_patient = p.id
#         JOIN Medicines m ON pm.id_medicine = m.id
#         ORDER BY pm.sale_date DESC
#         LIMIT 10
#     ''')
#     sales = cursor.fetchall()
#     cursor.close()
#     return jsonify(sales)

@app.route('/builders')
def builders():
    return render_template('builders.html')

# @app.route('/api/get-patients')
# def get_patients():
#     cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
#     cursor.execute('SELECT * FROM Patients')
#     patients = cursor.fetchall()
#     cursor.close()
#     return jsonify(patients)

# @app.route('/api/delete-patient/<int:id>', methods=['DELETE'])
# def delete_patient(id):
#     cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
#     cursor.execute('DELETE FROM Patients WHERE id = %s', (id,))
#     mysql.connection.commit()
#     cursor.close()
#     return jsonify({'message': 'Patient deleted successfully'})

# @app.route('/api/update-patient', methods=['POST'])
# def update_patient():
#     data = request.get_json()
#     patient_id = data['id']
#     name = data['name']
#     surname = data['surname']
#     phone_number = data['phone_number']
#     address = data['address']
#     email = data['email']

#     cursor = mysql.connection.cursor()
#     cursor.execute('''UPDATE Patients SET name = %s, surname = %s, phone_number = %s, address = %s, email = %s
#                       WHERE id = %s''',
#                    (name, surname, phone_number, address, email, patient_id))
#     mysql.connection.commit()
#     cursor.close()

#     return jsonify({'message': 'success'})

# @app.route('/api/go_add_patient')
# def go_add_patient():
#     return render_template('add_patient.html')

# @app.route('/api/add-patient', methods=['POST'])
# def add_patient():
#     patient_data = request.get_json()

#     name = patient_data.get('name')
#     surname = patient_data.get('surname')
#     cnp = patient_data.get('cnp')
#     birthday = patient_data.get('birthday')
#     gender = patient_data.get('gender')
#     address = patient_data.get('address')
#     phone_number = patient_data.get('phone_number')
#     email = patient_data.get('email')
#     diagnosis = patient_data.get('diagnosis')

#     if not all([name, surname, cnp, birthday, gender, address, phone_number, email, diagnosis]):
#         return jsonify({'message': 'Missing required fields'}), 400

#     query = """
#     INSERT INTO Patients (name, surname, cnp, birthday, gender, address, phone_number, email, diagnosis)
#     VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
#     """
#     cursor = mysql.connection.cursor()

#     try:
#         cursor.execute(query, (name, surname, cnp, birthday, gender, address, phone_number, email, diagnosis))
#         mysql.connection.commit()

#         cursor.close()
#         return jsonify({'message': 'Patient added successfully!'}), 200
#     except Exception as e:
#         print("Error inserting patient:", e)
#         cursor.close()
#         return jsonify({'message': 'Failed to add patient'}), 500


@app.route('/clients')
def clients():
    return render_template('clients.html')

# @app.route('/api/get-products')
# def get_medicines():
#     cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
#     cursor.execute('SELECT * FROM Medicines')
#     medicines = cursor.fetchall()
#     cursor.close()
#     return jsonify(medicines)

# @app.route('/api/delete-product/<int:id>', methods=['DELETE'])
# def delete_product(id):
#     cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
#     cursor.execute('DELETE FROM Medicines WHERE id = %s', (id,))
#     mysql.connection.commit()
#     cursor.close()
#     return jsonify({'message': 'Product deleted successfully'})

# @app.route('/go_add_product')
# def go_add_product():
#     return render_template('add_product.html')

# @app.route('/api/add_product', methods=['POST'])
# def add_product():
#     try:
#         medicine_data = request.get_json()

#         name = medicine_data.get('name')
#         producer = medicine_data.get('producer')
#         price = medicine_data.get('price')
#         expiration_date = medicine_data.get('expiration_date')
#         quantity = medicine_data.get('quantity')
#         category = medicine_data.get('category')
#         medical_prescription = medicine_data.get('medical_prescription')

#         cursor = mysql.connection.cursor()

#         cursor.execute('''INSERT INTO Medicines (name, producer, price, expiration_date, quantity, category, medical_prescription) 
#                           VALUES (%s, %s, %s, %s, %s, %s, %s)''', 
#                           (name, producer, price, expiration_date, quantity, category, medical_prescription))

#         mysql.connection.commit()

#         return jsonify({'message': 'Medicine added successfully!'}), 200

#     except Exception as e:
#         print(f"Error: {str(e)}")
#         return jsonify({'error': str(e)}), 500

#     finally:
#         if cursor:
#             cursor.close()

@app.route('/projects')
def projects():
    return render_template('projects.html')

# @app.route('/api/get-purchases')
# def get_purchases():
#     cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
#     cursor.execute('''
#         SELECT pm.id, p.name AS patient_name, m.name AS medicine_name, m.producer AS producer_name, pm.sale_date, pm.quantity, m.price * pm.quantity AS total_price
#         FROM Patients_medicines pm
#         JOIN Patients p ON pm.id_patient = p.id
#         JOIN Medicines m ON pm.id_medicine = m.id
#         ORDER BY pm.sale_date DESC
#     ''')
#     purchases = cursor.fetchall()
#     cursor.close()
#     return jsonify(purchases)

# @app.route('/go_add_purchase')
# def go_add_purchase():
#     return render_template('add_purchase.html')

# @app.route('/api/add_purchase', methods=['POST'])
# def add_purchase():
#     try:
#         data = request.get_json()

#         patient_name = data.get('patient_name')
#         patient_surname = data.get('patient_surname')
#         cnp = data.get('cnp')
#         medicine_name = data.get('medicine_name')
#         producer_name = data.get('producer_name')
#         quantity = data.get('quantity')

#         cursor = mysql.connection.cursor()

        
#         cursor.execute("SELECT id FROM Patients WHERE cnp = %s", (cnp,))
#         patient = cursor.fetchone()

#         cursor.execute("SELECT id FROM Medicines WHERE name = %s AND producer = %s", (medicine_name, producer_name))
#         medicine = cursor.fetchone()

#         if not patient:
#             return jsonify({'success': False, 'message': 'Patient not found'}), 400

#         if not medicine:
#             return jsonify({'success': False, 'message': 'Medicine not found'}), 400

#         cursor.execute("""
#             INSERT INTO Patients_medicines (id_patient, id_medicine, quantity)
#             VALUES (%s, %s, %s)
#         """, (patient[0], medicine[0], quantity))
        
#         mysql.connection.commit()

#         return jsonify({'success': True, 'message': 'Purchase added successfully!'})

#     except MySQLdb.Error as e:
#         print("Error inserting data:", e)
#         mysql.connection.rollback()
#         return jsonify({'success': False, 'error': str(e)}), 500

#     finally:
#         cursor.close()

@app.route('/contact')
def contact():
    return render_template('contact.html')

@app.route('/about')
def about():
    return render_template('about.html')

if __name__ == '__main__':
    app.run(debug=True)
