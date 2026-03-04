/*
 * @author Myxo victor
 * @date 1st march 2026
 * This file handles the registrations screen
 */

(function () {
  const showPassword = venjs.state(false);
  const fullName = venjs.state('');
  const email = venjs.state('');
  const level = venjs.state('');
  const school = venjs.state('');
  const department = venjs.state('');
  const password = venjs.state('');
  const confirm = venjs.state('');
  const isSubmitting = venjs.state(false);
  const registerButtonText = venjs.state('Create Account');
  const notify = (message) => {
    if (window.appMessage && typeof window.appMessage.show === 'function') {
      window.appMessage.show(message, 'Message');
      return;
    }
    alert(message);
  };

  const LEVEL_OPTIONS = [
    { value: '100level', label: '100 Level' },
    { value: '200level', label: '200 Level' },
    { value: '300level', label: '300 Level' },
    { value: '400level', label: '400 Level' },
    { value: '500level', label: '500 Level' },
    { value: '600level', label: '600 Level' },
    { value: 'ND1', label: 'ND 1' },
    { value: 'ND2', label: 'ND 2' },
    { value: 'HND1', label: 'HND 1' },
    { value: 'HND2', label: 'HND 2' },
    { value: 'Other', label: 'Other' }
  ];
  const SCHOOL_OPTIONS = [
    { value: 'Michael Okpara University of Agriculture, Umudike, mouau', label: 'Michael Okpara University of Agriculture, Umudike' },
    { value: 'University of Ibadan, ui', label: 'University of Ibadan' },
    { value: 'University of Lagos, unilag', label: 'University of Lagos' },
    { value: 'University of Nigeria, Nsukka, unn', label: 'University of Nigeria, Nsukka' },
    { value: 'Ahmadu Bello University, Zaria, abu', label: 'Ahmadu Bello University, Zaria' },
    { value: 'Obafemi Awolowo University, Ile-Ife, oau', label: 'Obafemi Awolowo University, Ile-Ife' },
    { value: 'University of Benin, uniben', label: 'University of Benin' },
    { value: 'University of Ilorin, unilorin', label: 'University of Ilorin' },
    { value: 'University of Port Harcourt, uniport', label: 'University of Port Harcourt' },
    { value: 'Federal University of Technology, Owerri, futo', label: 'Federal University of Technology, Owerri' },
    { value: 'Federal University of Technology, Akure, futa', label: 'Federal University of Technology, Akure' },
    { value: 'Federal University of Technology, Minna, futminna', label: 'Federal University of Technology, Minna' },
    { value: 'Nnamdi Azikiwe University, Awka, unizik', label: 'Nnamdi Azikiwe University, Awka' },
    { value: 'University of Uyo, uniuyo', label: 'University of Uyo' },
    { value: 'University of Calabar, unical', label: 'University of Calabar' },
    { value: 'University of Abuja, uniabuja', label: 'University of Abuja' },
    { value: 'University of Jos, unijos', label: 'University of Jos' },
    { value: 'Lagos State University, lasu', label: 'Lagos State University' },
    { value: 'Covenant University, Ota, covenant', label: 'Covenant University, Ota' },
    { value: 'Babcock University, Ilishan-Remo, babcock', label: 'Babcock University, Ilishan-Remo' },
    { value: 'Bayero University Kano, buk', label: 'Bayero University Kano' },
    { value: 'Ladoke Akintola University of Technology, lautech', label: 'Ladoke Akintola University of Technology' },
    { value: 'National Open University of Nigeria, noun', label: 'National Open University of Nigeria' },
    { value: 'Delta State University, Abraka, delsu', label: 'Delta State University, Abraka' },
    { value: 'Ebonyi State University, ebsu', label: 'Ebonyi State University' },
    { value: 'Enugu State University of Science and Technology, eksutech', label: 'Enugu State University of Science and Technology' },
    { value: 'Federal University, Kashere, fukashere', label: 'Federal University, Kashere' },
    { value: 'Federal University, Gusau, fukusara', label: 'Federal University, Gusau' },
    { value: 'Alex Ekwueme Federal University, Ndufu-Alike, funai', label: 'Alex Ekwueme Federal University, Ndufu-Alike' },
    { value: 'Kwara State University, kwasu', label: 'Kwara State University' },
    { value: 'Tai Solarin University of Education, tasued', label: 'Tai Solarin University of Education' }
  ];
  const DEPARTMENT_OPTIONS = [
    { value: 'Food Science and Technology', label: 'Food Science and Technology' },
    { value: 'Human Nutrition and Dietetics', label: 'Human Nutrition and Dietetics' },
    { value: 'Home Economics', label: 'Home Economics' },
    { value: 'Hotel Management and Tourism', label: 'Hotel Management and Tourism' },
    { value: 'Agricultural Economics', label: 'Agricultural Economics' },
    { value: 'Agricultural Extension and Rural Sociology', label: 'Agricultural Extension and Rural Sociology' },
    { value: 'Animal Breeding and Physiology', label: 'Animal Breeding and Physiology' },
    { value: 'Animal Nutrition and Forage Science', label: 'Animal Nutrition and Forage Science' },
    { value: 'Animal Production and Management', label: 'Animal Production and Management' },
    { value: 'Agronomy', label: 'Agronomy' },
    { value: 'Plant Health Management', label: 'Plant Health Management' },
    { value: 'Soil Science and Meteorology', label: 'Soil Science and Meteorology' },
    { value: 'Agricultural and Bio-resources Engineering', label: 'Agricultural and Bio-resources Engineering' },
    { value: 'Chemical Engineering', label: 'Chemical Engineering' },
    { value: 'Civil Engineering', label: 'Civil Engineering' },
    { value: 'Computer Engineering', label: 'Computer Engineering' },
    { value: 'Electrical and Electronics Engineering', label: 'Electrical and Electronics Engineering' },
    { value: 'Mechanical Engineering', label: 'Mechanical Engineering' },
    { value: 'Biochemistry', label: 'Biochemistry' },
    { value: 'Chemistry', label: 'Chemistry' },
    { value: 'Computer Science', label: 'Computer Science' },
    { value: 'Mathematics', label: 'Mathematics' },
    { value: 'Microbiology', label: 'Microbiology' },
    { value: 'Physics', label: 'Physics' },
    { value: 'Statistics', label: 'Statistics' },
    { value: 'Accounting', label: 'Accounting' },
    { value: 'Banking and Finance', label: 'Banking and Finance' },
    { value: 'Business Administration', label: 'Business Administration' },
    { value: 'Economics', label: 'Economics' },
    { value: 'Entrepreneurial Studies', label: 'Entrepreneurial Studies' },
    { value: 'Industrial Relations and Personnel Management', label: 'Industrial Relations and Personnel Management' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Fisheries and Aquatic Resources Management', label: 'Fisheries and Aquatic Resources Management' },
    { value: 'Forestry and Environmental Management', label: 'Forestry and Environmental Management' },
    { value: 'Environmental Management and Toxicology', label: 'Environmental Management and Toxicology' },
    { value: 'Veterinary Medicine', label: 'Veterinary Medicine' },
    { value: 'Agricultural Education', label: 'Agricultural Education' },
    { value: 'Business Education', label: 'Business Education' },
    { value: 'Computer Science Education', label: 'Computer Science Education' },
    { value: 'Industrial Technology Education', label: 'Industrial Technology Education' },
    { value: 'Home Economics Education', label: 'Home Economics Education' },
    { value: 'Geology', label: 'Geology' },
    { value: 'Mass Communication', label: 'Mass Communication' },
    { value: 'Political Science', label: 'Political Science' },
    { value: 'Sociology', label: 'Sociology' },
    { value: 'Philosophy', label: 'Philosophy' },
    { value: 'Psychology', label: 'Psychology' }
  ];

  const renderSelectField = ({ id, value, onChange, placeholder, options }) => venjs.createElement('select', {
    className: 'auth-field',
    id,
    value,
    onChange
  }, [
    venjs.createElement('option', {
      value: '',
      label: placeholder
    }, venjs.text({}, placeholder)),
    ...options.map((option) => venjs.createElement('option', {
      value: option.value,
      label: option.label
    }, venjs.text({}, option.label)))
  ]);

  const submitRegister = async ({ navigate } = {}) => {
    if (isSubmitting.get()) {
      return;
    }

    const payload = {
      fullName: fullName.get().trim(),
      email: email.get().trim(),
      password: password.get(),
      confirm: confirm.get(),
      level: level.get().trim(),
      institution: school.get().trim(),
      department: department.get().trim()
    };

    if (!payload.fullName || !payload.email || !payload.password || !payload.level || !payload.institution) {
      notify('All required fields must be filled.');
      return;
    }

    if (payload.password !== payload.confirm) {
      notify('Password and confirm password do not match.');
      return;
    }

    if (!window.registerLogic || typeof window.registerLogic.register !== 'function') {
      notify('Registration service is not available.');
      return;
    }

    isSubmitting.set(true);
    registerButtonText.set('Processing...');

    try {
      const result = await window.registerLogic.register({
        fullName: payload.fullName,
        email: payload.email,
        password: payload.password,
        department: payload.department,
        college: payload.institution,
        institution: payload.institution,
        state: 'Default',
        level: payload.level
      });

      if (result && result.success) {
        registerButtonText.set('Account Created!');
        setTimeout(() => {
          notify((result && result.message) || 'Registration successful!');
          if (typeof navigate === 'function') {
            navigate('/login');
          }
          isSubmitting.set(false);
          registerButtonText.set('Create Account');
        }, 250);
        return;
      }

      notify((result && result.message) || 'Registration failed.');
    } catch (error) {
      notify((error && error.message) || 'Unable to connect to server.');
    }

    isSubmitting.set(false);
    registerButtonText.set('Create Account');
  };

  window.renderRegisterScreen = ({ navigate } = {}) => venjs.div({
    className: 'auth-screen'
  }, [
    venjs.image({
      src: './images/logo.png',
      className: 'auth-logo'
    }),

    venjs.text({
      className: 'auth-title'
    }, 'Sign up'),

    venjs.text({
      className: 'auth-subtitle'
    }, 'Create your Space account'),

    venjs.input({
      className: 'auth-field',
      type: 'text',
      value: fullName.get(),
      id: 'reg_name',
      placeholder: 'Full name',
      onChange: (payload) => {
        fullName.set((payload && payload.value) || '');
      }
    }),

    venjs.input({
      className: 'auth-field',
      type: 'email',
      value: email.get(),
      id: 'reg_email',
      placeholder: 'Email address',
      onChange: (payload) => {
        email.set((payload && payload.value) || '');
      }
    }),

    renderSelectField({
      id: 'reg_level',
      value: level.get(),
      placeholder: 'Select your Level',
      options: LEVEL_OPTIONS,
      onChange: (payload) => {
        level.set((payload && payload.value) || '');
      }
    }),

    renderSelectField({
      id: 'reg_school',
      value: school.get(),
      placeholder: 'Select your School',
      options: SCHOOL_OPTIONS,
      onChange: (payload) => {
        school.set((payload && payload.value) || '');
      }
    }),

    renderSelectField({
      id: 'reg_department',
      value: department.get(),
      placeholder: 'Select your Department',
      options: DEPARTMENT_OPTIONS,
      onChange: (payload) => {
        department.set((payload && payload.value) || '');
      }
    }),

    venjs.input({
      className: 'auth-field',
      type: showPassword.get() ? 'text' : 'password',
      value: password.get(),
      id: 'reg_password',
      placeholder: 'Password',
      onChange: (payload) => {
        password.set((payload && payload.value) || '');
      }
    }),

    venjs.input({
      className: 'auth-field',
      type: showPassword.get() ? 'text' : 'password',
      value: confirm.get(),
      id: 'reg_confirm',
      placeholder: 'Confirm password',
      onChange: (payload) => {
        confirm.set((payload && payload.value) || '');
      }
    }),

    //to avoid conflicts please change ids to avoid matching with the one in login.js
    venjs.div({
      className: 'auth-toggle-row'
    }, [
      venjs.input({
        type: 'checkbox',
        checked: showPassword.get(),
        className: 'auth-checkbox',
        onClick: () => {
          showPassword.set((current) => !current);
        }
      }),

      venjs.text({
        className: 'auth-toggle-label'
      }, 'Show Password')
    ]),

    venjs.button({
      className: 'auth-primary-btn',
      disabled: isSubmitting.get(),
      onClick: () => submitRegister({ navigate })
    }, registerButtonText.get()),

    venjs.text({
      className: 'auth-link-text',
      //add on click event to return to login
      onClick: () => {
        if (typeof navigate === 'function') {
          navigate('/login');
        }
      }
    }, 'Already have an account? Sign in'),

    venjs.text({
      className: 'auth-footer'
    }, '(c) 2026 Aximon Platforms')
  ]);
})();
