from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from datetime import datetime
import os
import re

app = Flask(__name__)
CORS(app)

EXCEL_FILE = 'registrations.xlsx'

def validate_email(email):
    pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    return re.match(pattern, email) is not None

def validate_phone(phone):
    pattern = r'^\d{10}$'
    return re.match(pattern, phone) is not None

def initialize_excel():
    if not os.path.exists(EXCEL_FILE):
        df = pd.DataFrame(columns=[
            'timestamp',
            'name',
            'email',
            'phone',
            'age',
            'gender',
            'weight',
            'goal',
            'program'
        ])
        df.to_excel(EXCEL_FILE, index=False)

@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.json
        
        # Validate required fields
        required_fields = ['name', 'email', 'phone', 'age', 'gender', 'weight', 'goal', 'program']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400

        # Validate email format
        if not validate_email(data['email']):
            return jsonify({'error': 'Invalid email format'}), 400

        # Validate phone number
        if not validate_phone(data['phone']):
            return jsonify({'error': 'Phone number must be 10 digits'}), 400

        # Validate age
        try:
            age = int(data['age'])
            if age < 5 or age > 100:
                return jsonify({'error': 'Age must be between 5 and 100'}), 400
        except ValueError:
            return jsonify({'error': 'Invalid age format'}), 400

        # Validate weight
        try:
            weight = float(data['weight'])
            if weight < 20 or weight > 300:
                return jsonify({'error': 'Weight must be between 20 and 300 kg'}), 400
        except ValueError:
            return jsonify({'error': 'Invalid weight format'}), 400

        # Create new registration entry
        new_registration = {
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'name': data['name'],
            'email': data['email'],
            'phone': data['phone'],
            'age': data['age'],
            'gender': data['gender'],
            'weight': data['weight'],
            'goal': data['goal'],
            'program': data['program']
        }

        # Read existing data
        try:
            df = pd.read_excel(EXCEL_FILE)
        except FileNotFoundError:
            initialize_excel()
            df = pd.read_excel(EXCEL_FILE)

        # Check for duplicate email
        if data['email'] in df['email'].values:
            return jsonify({'error': 'Email already registered'}), 400

        # Append new registration
        df = pd.concat([df, pd.DataFrame([new_registration])], ignore_index=True)
        
        # Save to Excel
        df.to_excel(EXCEL_FILE, index=False)

        return jsonify({
            'message': 'Registration successful',
            'data': new_registration
        }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    initialize_excel()
    app.run(debug=True, port=5000) 