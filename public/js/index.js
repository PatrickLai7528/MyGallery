let main = () => {
  console.log("in main");
  const LOGIN_URL = "http://127.0.0.1:3000/login";
  const SIGN_UP_URL = "http://127.0.0.1:3000/signup";

  const TO_SIGN_UP_SELECTOR = "#to-sign-up";
  const TO_LOGIN_SELECTOR = "#to-login";

  const LOGIN_CONFIRM_SELECTOR = "#login-confirm";
  const LOGIN_FORM_SELECTOR = "#login-form";
  const LOGIN_USERNAME_SELECTOR = "#login-username-input";
  const LOGIN_PASSWORD_SELECTOR = "#login-password-input";

  const SIGN_UP_CONFIRM_SELECTOR = "#signup-confirm";
  const SIGN_UP_FORM_SELECTOR = "#signup-form";
  const SIGN_UP_USERNAME_SELECTOR = "#signup-username-input";
  const SIGN_UP_PASSWORD_SELECTOR = "#signup-password-input";
  const SIGN_UP_CONFIRM_PASSWORD_SELECTOR = "#signup-confirm-password-input";

  const MESSAGE_SELECTOR = ".ui.negative.message";
  const MESSAGE_TITLE_SELECTOR = ".ui.negative.message div";
  const MESSAGE_CONTENT_SELECTOR = ".ui.negative.message p"
  const MESSAGE_CLOSE_ICON_SELECTOR = ".ui.negative.message i"

  const VERIFICATION_CODE_SELECTOR = "#verification-code"
  const VERIFICATION_MODAL_SELECTOR = "#verification-modal";
  const VERIFICATION_CODE_IMPUT_SELECTOR = "#verification-code-input";

  const SUBMIT_VERIFICATION_CODE_BUTTON_SELECTOR = "#submit-verification-code-button";

  const USERNAMR_REGEX = /([a-z]|[A-Z]|[0-9]){5,20}/g;
  const PASSWORD_REGEX = /^[A-Za-z0-9]{6,16}$/;

  let loginForm = $(LOGIN_FORM_SELECTOR);
  let signUpForm = $(SIGN_UP_FORM_SELECTOR);


  let enableSignupForm = () => {
    signUpForm.css({
      display: "block"
    });
  };
  let changeVerificationCode = () => {
    $(VERIFICATION_CODE_SELECTOR).attr({
      src: "./verificationcode?" + Math.random()
    });
  }

  let enableVerificationModal = () => {
    changeVerificationCode();
    $(VERIFICATION_CODE_IMPUT_SELECTOR).val("");
    $(VERIFICATION_MODAL_SELECTOR).modal('setting', 'transition', "vertical flip").modal("show");
  }
  let disableVerificationModal = () => {
    $(VERIFICATION_MODAL_SELECTOR).modal('setting', 'transition', "vertical flip").modal("hide");
  }

  let disableSignupForm = () => {
    signUpForm.css({
      display: "none"
    });
    clearSignupForm();
    disableError();
  };

  let enableLoginForm = () => {
    loginForm.css({
      display: "block"
    });
  };

  let disableLoginForm = () => {
    loginForm.css({
      display: "none"
    });
    clearLoginForm();
    disableError();
  };

  let clearLoginForm = () => {
    $(LOGIN_USERNAME_SELECTOR).val("");
    $(LOGIN_PASSWORD_SELECTOR).val("");
  };

  let clearSignupForm = () => {
    $(SIGN_UP_USERNAME_SELECTOR).val("");
    $(SIGN_UP_PASSWORD_SELECTOR).val("");
    $(SIGN_UP_CONFIRM_PASSWORD_SELECTOR).val("");
  };

  let generateUrl = (username, pw, type) => {
    let prefix = "";
    switch (type) {
      case "login":
        prefix = LOGIN_URL;
        break;
      case "signup":
        prefix = SIGN_UP_URL;
        break;
      default:
        throw new Error("unexpected type");
    }

    return prefix + "/" + username + "/" + pw;
  };

  let checkLoginData = () => {
    console.log("checking");
    let username = $(LOGIN_USERNAME_SELECTOR);
    let pw = $(LOGIN_PASSWORD_SELECTOR);
    if (!username.val().match(USERNAMR_REGEX)) {
      username.addClass("error");
      setErrorMessage(
        "Username Error",
        "Only number and alphabet is allowed, 5 to 20 lettes, case sensitive"
      );
      return false;
    }

    if (!pw.val().match(PASSWORD_REGEX)) {
      pw.addClass("error");
      setErrorMessage(
        "Password Error",
        "Only number and alphabet is allowed, 6 to 20 lettes, case sensitive"
      );
      return false;
    }
    return true;
  }

  let sendLogin = () => {
    let username = $(LOGIN_USERNAME_SELECTOR);
    let pw = $(LOGIN_PASSWORD_SELECTOR);

    $.ajax({
      url: generateUrl(username.val(), pw.val(), "login"),
      type: "GET",
      success: function (response) {
        response = JSON.parse(response);
        if (response.isValid) {
          document.cookie = "token=" + response.token + ";";
          $(location).attr("href", "/photo");
        } else {
          setErrorMessage("Login Error", response.message);
          clearLoginForm();
        }
      }
    });
  };

  let setErrorMessage = (title, content) => {
    let jqMessage = $(MESSAGE_SELECTOR);
    let jqMessageTitle = $(MESSAGE_TITLE_SELECTOR);
    let jqMessageContent = $(MESSAGE_CONTENT_SELECTOR);
    jqMessage.removeClass("hidden");
    jqMessageTitle.text(title);
    jqMessageContent.text(content);
  };

  let checkSignUpData = () => {
    console.log("checking");
    let username = $(SIGN_UP_USERNAME_SELECTOR);
    let pw = $(SIGN_UP_PASSWORD_SELECTOR);
    let pwAgain = $(SIGN_UP_CONFIRM_PASSWORD_SELECTOR);
    if (!username.val().match(USERNAMR_REGEX)) {
      username.addClass("error");
      setErrorMessage(
        "Username Error",
        "Only number and alphabet is allowed, 5 to 20 lettes, case sensitive"
      );
      return false;
    }

    if (!pw.val().match(PASSWORD_REGEX)) {
      pw.addClass("error");
      setErrorMessage(
        "Password Error",
        "Only number and alphabet is allowed, 6 to 20 lettes, case sensitive"
      );
      return false;
    }

    if (pw.val() !== pwAgain.val()) {
      pwAgain.addClass("error");
      setErrorMessage(
        "Please Confirm Password",
        "Retype your password again carefully"
      );
      return false;
    }
    return true;
  }

  let sendSigUp = () => {
    let username = $(SIGN_UP_USERNAME_SELECTOR);
    let pw = $(SIGN_UP_PASSWORD_SELECTOR);
    // let pwAgain = $(SIGN_UP_CONFIRM_PASSWORD_SELECTOR);

    $.ajax({
      url: generateUrl(username.val(), pw.val(), "signup"),
      type: "POST",
      success: function (response) {
        console.log(response);
        response = JSON.parse(response);
        console.log(response);
        if (response.isValid) {
          enableLoginForm();
          disableSignupForm();
        } else {
          setErrorMessage("Signup Error", response.message);
          clearSignupForm();
        }
      }
    });
  };

  let disableError = () => {
    let loginUsername = $(LOGIN_USERNAME_SELECTOR);
    let loginPassword = $(LOGIN_PASSWORD_SELECTOR);
    let signUpUsername = $(SIGN_UP_USERNAME_SELECTOR);
    let signUpPassword = $(SIGN_UP_PASSWORD_SELECTOR);
    let signUpConfirmPassword = $(SIGN_UP_CONFIRM_PASSWORD_SELECTOR);
    let message = $(MESSAGE_SELECTOR);
    if (loginUsername.hasClass("error")) {
      loginUsername.removeClass("error");
    }
    if (loginPassword.hasClass("error")) {
      loginPassword.removeClass("error");
    }
    if (signUpUsername.hasClass("error")) {
      signUpUsername.removeClass("error");
    }
    if (signUpPassword.hasClass("error")) {
      signUpPassword.removeClass("error");
    }
    if (signUpConfirmPassword.hasClass("error")) {
      signUpConfirmPassword.removeClass("error");
    }
    if (!message.hasClass("hidden")) {
      message.addClass("hidden");
    }
  };

  let submitVerification = () => {
    console.log("find me bitch");
    let actualCode = $(VERIFICATION_CODE_IMPUT_SELECTOR).val();
    let temp = document.cookie.split(";");
    let expectCode = "";
    for (let cookie of temp) {
      console.log(cookie);
      if (cookie.indexOf("captcha") !== -1) {
        expectCode = cookie.split("=")[1];
      }
    }
    if (actualCode.toLowerCase() == expectCode) {
      if (checkSignUpData()) {
        sendSigUp();
        enableLoginForm();
        disableSignupForm();
      }
      disableVerificationModal();
    } else {
      setErrorMessage("Verfication Fail", "Please Look Carefully")
    }
  }

  let setEventListenr = () => {
    $(TO_LOGIN_SELECTOR).click(e => {
      e.preventDefault();
      enableLoginForm();
      disableSignupForm();

    });

    $(TO_SIGN_UP_SELECTOR).click(e => {
      e.preventDefault();
      enableSignupForm();
      disableLoginForm();
    });

    $(LOGIN_CONFIRM_SELECTOR).click(e => {
      e.preventDefault();
      if (checkLoginData()) {
        sendLogin();
      }
    });

    $(SIGN_UP_CONFIRM_SELECTOR).click(e => {
      e.preventDefault();
      if (checkSignUpData()) {
        enableVerificationModal();
      }
    });

    $(LOGIN_PASSWORD_SELECTOR).on("input", e => {
      e.preventDefault();
      disableError();
    });
    $(LOGIN_USERNAME_SELECTOR).on("input", e => {
      e.preventDefault();
      disableError();
    });
    $(SIGN_UP_USERNAME_SELECTOR).on("input", e => {
      e.preventDefault();
      disableError();
    });
    $(SIGN_UP_USERNAME_SELECTOR).on("input", e => {
      e.preventDefault();
      disableError();
    });
    $(SIGN_UP_CONFIRM_PASSWORD_SELECTOR).on("input", e => {
      e.preventDefault();
      disableError();
    });
    $(MESSAGE_CLOSE_ICON_SELECTOR).click(e => {
      e.preventDefault();
      disableError();
    });
    $(SUBMIT_VERIFICATION_CODE_BUTTON_SELECTOR).click(e => {
      e.preventDefault();
      submitVerification();
    });
  };

  clearLoginForm();
  setEventListenr();
  disableSignupForm();
};