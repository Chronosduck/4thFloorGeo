from flask import Flask, jsonify, render_template
import requests



app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/quiz')
def get_quiz():
    try:
        response = requests.get('https://opentdb.com/api.php?amount=1&type=multiple')
        data = response.json()

        if 'results' not in data or not data['results']:
            return jsonify({'error': 'No quiz data available'}), 500

        question_data = data['results'][0]
        question = {
            'question': question_data['question'],
            'correct_answer': question_data['correct_answer'],
            'choices': question_data['incorrect_answers'] + [question_data['correct_answer']]
        }

        import random
        random.shuffle(question['choices'])

        return jsonify(question)

    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=port)
