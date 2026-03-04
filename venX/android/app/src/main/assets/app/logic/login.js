(function () {
  const LOGIN_API_URL = 'https://www.space.aximon.ng/api/login.php';
  const STUDENT_ID_KEY = 'space_student_id';
  const LAST_LOGIN_KEY = 'space_last_login';

  const login = async ({ email, password, rememberMe = false } = {}) => {
    const payload = {
      email: String(email || '').trim(),
      password: String(password || ''),
      remember_me: !!rememberMe
    };

    const response = await fetch(LOGIN_API_URL, {
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

  const resolveStudentId = (payload) => {
    if (!payload || typeof payload !== 'object') return '';
    const direct = payload.student_id;
    if (direct !== undefined && direct !== null && String(direct).trim() !== '') {
      return String(direct).trim();
    }
    const nested = payload.user_profile && payload.user_profile.id;
    if (nested !== undefined && nested !== null && String(nested).trim() !== '') {
      return String(nested).trim();
    }
    return '';
  };

  const storeStudentId = (payload) => {
    const studentId = resolveStudentId(payload);
    if (!studentId || typeof localStorage === 'undefined') {
      return '';
    }

    try {
      localStorage.setItem(STUDENT_ID_KEY, studentId);
      localStorage.setItem(
        LAST_LOGIN_KEY,
        JSON.stringify({
          student_id: studentId,
          at: new Date().toISOString()
        })
      );
      return studentId;
    } catch (_err) {
      return '';
    }
  };

  const getStoredStudentId = () => {
    if (typeof localStorage === 'undefined') return '';
    try {
      return String(localStorage.getItem(STUDENT_ID_KEY) || '').trim();
    } catch (_err) {
      return '';
    }
  };

  const clearStoredStudentId = () => {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.removeItem(STUDENT_ID_KEY);
      localStorage.removeItem(LAST_LOGIN_KEY);
    } catch (_err) {
    }
  };

  window.loginLogic = {
    login,
    url: LOGIN_API_URL,
    storeStudentId,
    getStoredStudentId,
    clearStoredStudentId
  };
})();
