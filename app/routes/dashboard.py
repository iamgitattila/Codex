"""
Dashboard Routes - Serve the frontend dashboard
"""
from flask import Blueprint, render_template, send_from_directory
from flask_login import login_required
import os

dashboard_bp = Blueprint('dashboard', __name__)


@dashboard_bp.route('/')
def index():
    """Serve main dashboard page"""
    return render_template('index.html')


@dashboard_bp.route('/dashboard')
@login_required
def dashboard():
    """Serve authenticated dashboard"""
    return render_template('dashboard.html')


@dashboard_bp.route('/campaigns')
@login_required
def campaigns():
    """Serve campaigns page"""
    return render_template('campaigns.html')


@dashboard_bp.route('/rules')
@login_required
def rules():
    """Serve automation rules page"""
    return render_template('rules.html')


@dashboard_bp.route('/analytics')
@login_required
def analytics():
    """Serve analytics page"""
    return render_template('analytics.html')


@dashboard_bp.route('/login')
def login():
    """Serve login page"""
    return render_template('login.html')


@dashboard_bp.route('/register')
def register():
    """Serve register page"""
    return render_template('register.html')
