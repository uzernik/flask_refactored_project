from flask import request
import logging
from flask import jsonify
from flask_cors import CORS, cross_origin
from .services.data_processing import process_etf_data_dt, process_etf_data_chart, add_etf, list_routes, fetch_etf_data, update_etf_info
import pandas as pd
import numpy as np
import os

def configure_routes(app):
    app.route('/api/etfs', methods=['GET'])(get_etf_data)
    app.route('/api/etfs/chart_data', methods=['GET'])(get_etf_chart_data_double)

    @app.route('/api/etfs/add', methods=['POST'])
    @cross_origin(origins="*")  # CORS applied here, especially important for POST methods
    ##app.route('/api/etfs/add', methods=['POST'])(add_etf)
    def add_etf():
        try:
            ##logging.info("add_etf endpoint called")
            etf_data = request.get_json()

            if etf_data is None:
                logging.error("Failed to get JSON from request") 
                response = jsonify({"error": "Invalid JSON"})
                response.status_code = 400
                return response

            symbol = etf_data.get('symbol')
            if not symbol:
                logging.error("ETF symbol is missing")
                response = jsonify({"error": "ETF symbol is required"})
                response.status_code = 400
                return response

            ##logging.info(f"Fetching data for symbol: {symbol}")

            # Fetch historical data
            try:
                history = fetch_etf_data(symbol)
                logging.info(f"Fetched {len(history)} rows of historical data for {symbol}")
            except Exception as e:
                logging.error(f"Failed to fetch data for {symbol}: {str(e)}")
                response = jsonify({"error": str(e)})
                response.status_code = 500
                return response

            if history.empty:
                logging.error(f"No data found for ETF symbol: {symbol}")
                response = jsonify({"error": f"No data found for ETF symbol: {symbol}"})
                response.status_code = 404
                return response

            # Reset index to convert it into a column named "Date"
            history.reset_index(inplace=True)

            # Keep only "Date" and "Close" columns
            history['Date'] = pd.to_datetime(history['Date']).dt.strftime('%Y-%m-%d')
            history = history[['Date', 'Close']]

            # Round the "Close" column to 3 decimal places
            history['Close'] = history['Close'].round(3)

            # Save the fetched and rounded data as a CSV file in the 'data' directory
            data_directory = '../data'
            if not os.path.exists(data_directory):
                os.makedirs(data_directory)

            csv_filename = os.path.join(data_directory, f"{symbol}.csv")
            try:
                history.to_csv(csv_filename, index=False)  # Don't include the index in the CSV
                logging.info(f"ETF data saved successfully for symbol: {symbol} at {csv_filename}")
            except Exception as e:
                logging.error(f"Failed to save CSV for {symbol}: {str(e)}")
                response = jsonify({"error": f"Failed to save CSV for {symbol}: {str(e)}"})
                response.status_code = 500
                return response

            '''
            # Fetch sector information and update ETF info JSON file
            try:
                sector = fetch_etf_sector(symbol)
                # update_etf_info(symbol, sector)
            except Exception as e:
                logging.error(f"Failed to fetch or update sector information for {symbol}: {str(e)}")
                response = jsonify({"error": f"Failed to fetch or update sector information for {symbol}: {str(e)}"})
                response.status_code = 500
                return response
            '''
            
            # Return success response
            response = jsonify({"message": f"ETF {symbol} has been added successfully."})
            logging.info(f"ETF {symbol} has been added successfully.")
            ##response.headers.add("Access-Control-Allow-Origin", "*")        
            return response

        except Exception as e:
            logging.error(f"An error occurred while adding the ETF: {str(e)}")
            response = jsonify({"error": f"An error occurred while adding the ETF: {str(e)}"})
            response.status_code = 500
            return response
    
    
    app.route('/routes', methods=['GET'])(list_routes)
    # Additional routes can be configured here

def get_etf_data():
    data = process_etf_data_dt()
    response = jsonify(data)
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response

def get_etf_chart_data_double():
    data = process_etf_data_chart()
    response = jsonify(data)
    response.headers.add("Access-Control-Allow-Origin", "*")    
    return response

'''
def add_etf():
    try:
        logging.info("add_etf endpoint called")
        etf_data = request.get_json()

        if etf_data is None:
            logging.error("Failed to get JSON from request")
            response = jsonify({"error": "Invalid JSON"})
            response.status_code = 400
            return response

        symbol = etf_data.get('symbol')
        if not symbol:
            logging.error("ETF symbol is missing")
            response = jsonify({"error": "ETF symbol is required"})
            response.status_code = 400
            return response

        logging.info(f"Fetching data for symbol: {symbol}")

        # Fetch historical data
        try:
            history = fetch_etf_data(symbol)
            logging.info(f"Fetched {len(history)} rows of historical data for {symbol}")
        except Exception as e:
            logging.error(f"Failed to fetch data for {symbol}: {str(e)}")
            response = jsonify({"error": str(e)})
            response.status_code = 500
            return response

        if history.empty:
            logging.error(f"No data found for ETF symbol: {symbol}")
            response = jsonify({"error": f"No data found for ETF symbol: {symbol}"})
            response.status_code = 404
            return response

        # Reset index to convert it into a column named "Date"
        history.reset_index(inplace=True)
        
        # Keep only "Date" and "Close" columns
        history['Date'] = pd.to_datetime(history['Date']).dt.strftime('%Y-%m-%d')
        history = history[['Date', 'Close']]

        # Round the "Close" column to 3 decimal places
        history['Close'] = history['Close'].round(3)

        # Save the fetched and rounded data as a CSV file in the 'data' directory
        data_directory = 'data'
        if not os.path.exists(data_directory):
            os.makedirs(data_directory)

        csv_filename = os.path.join(data_directory, f"{symbol}.csv")
        try:
            history.to_csv(csv_filename, index=False)  # Don't include the index in the CSV
            logging.info(f"ETF data saved successfully for symbol: {symbol} at {csv_filename}")
        except Exception as e:
            logging.error(f"Failed to save CSV for {symbol}: {str(e)}")
            response = jsonify({"error": f"Failed to save CSV for {symbol}: {str(e)}"})
            response.status_code = 500
            return response

        # Fetch sector information and update ETF info JSON file
        try:
            sector = fetch_etf_sector(symbol)
            # update_etf_info(symbol, sector)
        except Exception as e:
            logging.error(f"Failed to fetch or update sector information for {symbol}: {str(e)}")
            response = jsonify({"error": f"Failed to fetch or update sector information for {symbol}: {str(e)}"})
            response.status_code = 500
            return response

        # Return success response
        response = jsonify({"message": f"ETF {symbol} has been added successfully."})
        logging.info(f"ETF {symbol} has been added successfully.")
        response.headers.add("Access-Control-Allow-Origin", "*")        
        return response

    except Exception as e:
        logging.error(f"An error occurred while adding the ETF: {str(e)}")
        response = jsonify({"error": f"An error occurred while adding the ETF: {str(e)}"})
        response.status_code = 500
        return response
'''

def list_routes():
    import urllib
    output = []
    for rule in app.url_map.iter_rules():
        options = {}
        for arg in rule.arguments:
            options[arg] = "[{0}]".format(arg)
        
        methods = ','.join(rule.methods)
        url = url_for(rule.endpoint, **options)
        line = urllib.parse.unquote("{:50s} {:20s} {}".format(rule.endpoint, methods, url))
        output.append(line)
    
    return "<br>".join(output)

# Other functions mapped in routes can also be defined here.


