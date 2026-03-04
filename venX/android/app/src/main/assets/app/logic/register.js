(function () {
  const REGISTER_API_URL = 'https://www.space.aximon.ng/api/register.php';

  const register = async ({
    fullName,
    email,
    password,
    department,
    college,
    institution,
    state = 'Default',
    level
  } = {}) => {
    const payload = {
      full_name: String(fullName || '').trim(),
      email: String(email || '').trim(),
      password: String(password || ''),
      dept: String(department || '').trim(),
      college: String(college || '').trim(),
      institution: String(institution || '').trim(),
      state: String(state || 'Default').trim(),
      level: String(level || '').trim()
    };

    const response = await fetch(REGISTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(payload)
    });

    let data;
    try {
      data = await response.json();
    } catch (_err) {
      data = {
        success: false,
        message: 'Invalid response from server.'
      };
    }

    if (!response.ok && data.success !== false) {
      data.success = false;
      data.message = data.message || `Request failed (${response.status}).`;
    }

    return data;
  };

  window.registerLogic = {
    register,
    url: REGISTER_API_URL
  };
})();
