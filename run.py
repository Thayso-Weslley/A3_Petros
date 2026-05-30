from flask import Flask, render_template

app = Flask(__name__, template_folder='app/templates', static_folder='app/static')

@app.route('/')
def index():
    # O Flask procura automaticamente dentro da pasta /templates
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)