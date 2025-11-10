"""
Main Application Entry Point
"""
from app import create_app, db
from app.models import *

app = create_app()


@app.shell_context_processor
def make_shell_context():
    """Add database instance and models to shell context"""
    return {
        'db': db,
        'User': User,
        'AdAccount': AdAccount,
        'Campaign': Campaign,
        'AutomationRule': AutomationRule,
        'RuleCondition': RuleCondition,
        'RuleAction': RuleAction,
        'Analytics': Analytics,
        'Notification': Notification,
        'AutomationTemplate': AutomationTemplate,
        'ABTest': ABTest
    }


if __name__ == '__main__':
    with app.app_context():
        # Create database tables
        db.create_all()

    app.run(debug=True, host='0.0.0.0', port=5000)
