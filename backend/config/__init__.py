from firebase_admin import credentials, initialize_app

cred = credentials.ApplicationDefault()
initialize_app(cred)
