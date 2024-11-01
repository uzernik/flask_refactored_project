from flask import Flask
from flask_cors import CORS
from .routes import configure_routes
from .services.logging_config import setup_logging

def create_app():
    app = Flask(__name__)
    setup_logging(app)
    # Apply CORS to all routes
    CORS(app, resources={r"/api/*": {"origins": "*"}})  # Adjust origins as needed
    configure_routes(app)
    return app


