ERRORS = {
  SignInError: {
    en: {
      code: 401,
      name: 'SIGN_IN_ERROR',
      title: 'Sign In Failure',
      msg: 'Failed to sign in.'
    }
  },
  SignUpError: {
    en: {
      code: 401,
      name: 'SIGN_UP_ERROR',
      title: 'Sign Up Failure',
      msg: 'Failed to sign up. You may already have an existing account with us.'
    }
  },
  UserNotFoundError: {
    en: {
      code: 401,
      name: 'USER_NOT_FOUND',
      title: 'Cannot find user',
      msg: 'We don\'t have a record of your account in our database'
    }
  },
  MissingRequiredData: {
    code: 400,
    name: 'MISSING_DATA',
    title: 'Missing Data',
    msg: ' field is required as part of the request body.'
  },
  InvalidPermission: {
    en: {
      code: 401,
      name: 'INVALID_PERMISSION',
      title: 'Invalid Permission',
      msg: 'Your account has no valid permission to access this area of the systems. Ask your system admin to grant you access.'
    }
  }
};

SUCCESS = {
  Success: {
    en: {
      code: 200,
      name: 'SUCCESS',
      title: 'Success',
      msg: 'Success'
    }
  }
};

MSG = {
  UserExistsError: {
    en: 'A user with the given email is already registered.'
  }
};
