"""
A server used to test YourBackgroundEveryWhere.
"""
from flask import Flask

app = Flask("YourBackgroundEverywhere")

@app.route("/")
def index():
    content = [None]*50
    for i in range(50):
        content[i] = f'<p style="font-size: 2em; {"color: white;" if (i+1)%2 == 0 else ""}">YourBackgroundEverywhere'
        
    return f"</style><div style='display: flex;\
    flex-direction: row;\
    flex-wrap: wrap;\
    align-items: center;\
    align-content: flex-start;\
    justify-content: space-between'>{''.join(content)}</div>"

if __name__ == "__main__":
    app.run()
