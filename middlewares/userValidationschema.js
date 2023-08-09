const yup = require("yup");

const userValidationschema = yup.object().shape({
    username: yup.string().min(2, 'Too Short!').max(50, 'Too Long!').required('Required username').matches(/^[a-zA-Z]+$/),
    email: yup.string().email("Invalid email address").required("Email is required").matches(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/),
    bvn:yup.number().integer().min(11, 'Invalid BVN').required('Bvn is required'),
    password:yup.string().matches(/^.{8,}$/, 'Password must be at least 8 characters long.').required('Password is required.'),
});

const contributionValidationschema = yup.object().shape({
    contributionname:yup.string().min(2, 'Too Short!').max(50, 'Too Long!').required("Required username").matches(/^[a-zA-Z ]+$/,"Only alphabetic characters are allowed"),
    amount:yup.number().required("Amount is required"),
    plan:yup.string().required("Plan is required"),
    interest:yup.number().required("Interest is required").test(
        'is-percentage',
        'Interest must be a valid percentage',
        (value) => {
            return value >= 0 && value <= 100;
        }
    ),
    nopeople:yup.number().required("Number of people is required"),
    image: yup.string().required("Image is required").matches(/^data:image\/(png|jpg|jpeg|gif);base64,/)

})

module.exports = {userValidationschema,contributionValidationschema}