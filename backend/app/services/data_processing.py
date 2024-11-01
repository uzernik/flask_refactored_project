import pandas as pd
import numpy as np
import os
from scipy.signal import savgol_filter
import yfinance as yf 
from flask import url_for


def detrend_data(prices):
    x = np.arange(len(prices))
    y = np.array(prices)
    model = np.polyfit(x, y, 3)
    trend = np.poly1d(model)
    detrended = y - trend(x)
    return detrended

def detrend_data_norm(prices, etf_name):
    x = np.arange(len(prices))
    y = np.array(prices)
    model = np.polyfit(x, y, 3)
    trend = np.poly1d(model)
    detrended = y - trend(x)
    min_val_D = np.min(detrended)
    max_val_D = np.max(detrended)
    print(f"MIN and MAX for ETF symbol {etf_name}: {min_val_D} {max_val_D}")
    normalized_detrended = 100 * (detrended - min_val_D) / (max_val_D - min_val_D) if max_val_D != min_val_D else np.zeros_like(detrended)
    return normalized_detrended.tolist()

def smooth_data(prices, window_length=11, polyorder=3):
    if len(prices) < window_length:
        window_length = len(prices) if len(prices) % 2 != 0 else len(prices) - 1
    elif window_length % 2 == 0:
        window_length += 1
    smoothed_prices = savgol_filter(prices, window_length=window_length, polyorder=polyorder)
    return smoothed_prices.tolist()

def norm_close(prices):
    min_val_C = np.min(prices)
    max_val_C = np.max(prices)
    normalized = 200 * (prices - min_val_C) / (max_val_C - min_val_C) if max_val_C != min_val_C else np.zeros_like(prices)
    return normalized.tolist(), min_val_C, max_val_C

def calculate_color(value, max_val_C, min_val_C):
    if value == 0:
        return None
    if max_val_C == min_val_C:
        return 0
    return round(((value - min_val_C) / (max_val_C - min_val_C) * 20) - 10, 2)

def process_etf_data_dt(directory='../data'):
    date_indexed_etfs = {}
    for filename in os.listdir(directory):
        if filename.endswith('.csv'):
            full_path = os.path.join(directory, filename)
            df = pd.read_csv(full_path)
            print(f"Processing ETF data from file: {filename}")
            df = df[['Date', 'Close']]  # Keep only Date and Close columns
            df['Date'] = pd.to_datetime(df['Date'], errors='coerce', utc=True).dt.strftime('%Y-%m-%d')
            etf_name = filename[:-4]
            max_close = df['Close'].max()
            min_close = df['Close'].min()
            df = df.dropna(subset=['Close'])  # Drop rows where 'Close' is missing
            df['Detrended Closing'] = detrend_data_norm(df['Close'], etf_name)
            prev_close = 0.0
            close = 0.0
            for index, row in df.iterrows():
                date = row['Date']
                prev_close = close
                close = round(row['Close'], 2)
                color = calculate_color(close, max_close, min_close)
                detrended_close = round(row['Detrended Closing'], 2)
                if date not in date_indexed_etfs:
                    date_indexed_etfs[date] = {}
                date_indexed_etfs[date][etf_name] = {
                    'Close': round(close, 2),
                    'Color': round(color, 2) if color is not None else 0,
                    'DC': round(detrended_close, 2),
                    'GLP': round(((close - prev_close) / prev_close * 100), 2) if prev_close != 0 else 0
                }
    return date_indexed_etfs

def process_etf_data_chart(directory='../data'):
    date_indexed_etfs = {}
    min_max_values = {}
    for filename in os.listdir(directory):
        if filename.endswith('.csv'):
            full_path = os.path.join(directory, filename)
            df = pd.read_csv(full_path)
            print(f"Processing chart data from file: {filename}")
            df = df[['Date', 'Close']]  # Keep only Date and Close columns
            df['Date'] = pd.to_datetime(df['Date'], errors='coerce', utc=True).dt.strftime('%Y-%m')
            etf_name = filename[:-4]

            df = df.dropna(subset=['Close'])  # Drop rows where 'Close' is missing

            # Now perform detrending, normalization, and smoothing on valid data only
            df['Detrended'] = detrend_data(df['Close'])
            df['Normalized Close'], min_val_C, max_val_C = norm_close(df['Close'])
            df['Normalized Detrended'] = detrend_data_norm(df['Close'], etf_name)
            df['Smoothed'] = smooth_data(df['Normalized Detrended'],201,1)
            df['Smoothed1'] = smooth_data(df['Normalized Detrended'],401,1)
            df['Smoothed2'] = smooth_data(df['Normalized Detrended'],601,1)            
            min_max_values[etf_name] = {'min': min_val_C, 'max': max_val_C}
            
            for index, row in df.iterrows():
                date = row['Date']
                normalized_close = round(row['Normalized Close'], 2)
                detrended = round(row['Detrended'], 2)
                normalized_detrended = round(row['Normalized Detrended'], 2) if not pd.isna(row['Normalized Detrended']) else None
                smoothed = round(row['Smoothed'], 2) if not pd.isna(row['Smoothed']) else None
                smoothed1 = round(row['Smoothed1'], 2) if not pd.isna(row['Smoothed1']) else None
                smoothed2 = round(row['Smoothed2'], 2) if not pd.isna(row['Smoothed2']) else None                                
                close = round(row['Close'], 2)

                # Log the values for debugging between specific dates
                if False and '2006-11' <= date <= '2007-07' and filename.startswith('BND.csv'):
                    print(f"Date: {date}, ETF: {etf_name}, Close: {close}, Normalized Close: {normalized_close}, Detrended: {detrended}, Normalized Detrended: {normalized_detrended}, Smoothed: {smoothed}")
                
                if date not in date_indexed_etfs:
                    date_indexed_etfs[date] = {}
                date_indexed_etfs[date][etf_name] = [normalized_close, detrended, close, normalized_detrended, smoothed, smoothed1, smoothed2]
    return {'data': date_indexed_etfs, 'min_max': min_max_values}

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
        return response

    except Exception as e:
        logging.error(f"An error occurred while adding the ETF: {str(e)}")
        response = jsonify({"error": f"An error occurred while adding the ETF: {str(e)}"})
        response.status_code = 500
        return response

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

def fetch_etf_data(symbol):
    try:
        etf = yf.Ticker(symbol)
        history = etf.history(period="max")
        return history
    except Exception as e:
        raise Exception(f"Failed to fetch data for {symbol}: {str(e)}")

def fetch_etf_sector(symbol):
    try:
        etf = yf.Ticker(symbol)
        sector_info = etf.info.get('sector', 'N/A')
        return sector_info
    except Exception as e:
        print(f"Failed to fetch sector information for {symbol}: {str(e)}")
        return 'N/A'

def update_etf_info(symbol, sector, data_directory='../frontend/src/data'):
    etfs_info_path = os.path.join(data_directory, 'etfs_info.json')
    etfs_info = {}

    # Read existing data
    if os.path.exists(etfs_info_path):
        with open(etfs_info_path, 'r') as f:
            etfs_info = json.load(f)

    # Update with new ETF information
    etfs_info[symbol] = {
        "sector": sector,
        "sectorSize": "N/A"  # Assuming sector size is not available, set as 'N/A'
    }

    # Write updated info back to the file
    with open(etfs_info_path, 'w') as f:
        json.dump(etfs_info, f, indent=4)
        print(f"ETF info updated successfully for symbol: {symbol}")
