# app/api/auth/auth_routes.py
from flask import Blueprint, render_template, request, redirect, url_for, session, flash
from functools import wraps

auth_bp = Blueprint('auth', __name__)

# DECORATOR: Coloque isso antes de qualquer rota que exija login
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_logged' not in session:
            return redirect(url_for('auth.login'))
        return f(*args, **kwargs)
    return decorated_function

# ROTA DA HOME: Substitui ou intercepta a rota padrão do index
@auth_bp.route('/')
@login_required
def index():
    # Só renderiza o app se passar pelo decorator
    return render_template('index.html')

# ROTA DE LOGIN
@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        # Validação simples (Substitua depois por busca no banco se necessário)
        if username == 'thayson' and password == 'engenharia123':
            session['user_logged'] = username
            return redirect(url_for('auth.index'))
        else:
            flash('Usuário ou senha incorretos.')
            return redirect(url_for('auth.login'))
            
    return render_template('login.html')

# ROTA DE LOGOUT
@auth_bp.route('/logout')
def logout():
    session.pop('user_logged', None)
    return redirect(url_for('auth.login'))