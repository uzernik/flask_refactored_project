def format_date(date_string):
    # Example utility to format dates
    from datetime import datetime
    return datetime.strptime(date_string, '%Y-%m-%d').strftime('%B %d, %Y')
