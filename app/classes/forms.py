from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, BooleanField, SubmitField, SelectField
from wtforms.validators import DataRequired
from wtforms.validators import ValidationError

#Function to validate a person's name. This creates a custom validator.
def validate_name(form, field):
    if len(field.data) > 12:
        raise ValidationError('Name must be less than 12 characters long.')

#Class to generate the login form for the main page
class LoginForm(FlaskForm):
    room_code = StringField('Room Code', validators=[DataRequired()])
    name = StringField('Name (Limit 12 Characters)', validators=[DataRequired(), validate_name])
    char_select = SelectField('How are you feeling?', choices = [('0', "Chill"), ('1', "A million bucks"), ('2', "Mischievous"), ('3', "Carefree"), ('4', "Clean")])
    submit = SubmitField('Play')

