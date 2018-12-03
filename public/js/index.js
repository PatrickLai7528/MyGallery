let main = () => {
	console.log("in main");
	const LOGIN_URL = "http://127.0.0.1:3000/login";
	const SIGN_UP_URL = "http://127.0.0.1:3000/signup";

	let loginForm = $("#login-form");
	let signUpForm = $("#signup-form");

	// let isPasswordError = false;
	// let isUsernameError = false;
	// let isConfirmPasswordError = false;

	let enableSignupForm = () => {
		signUpForm.css({
			display: "block"
		});
	};

	let disableSignupForm = () => {
		signUpForm.css({
			display: "none"
		});
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
				throw new Error("unexpected type")
		}

		return prefix + "/" + username + "/" + pw;
	};


	let sendLogin = () => {
		let username = $("#login-username-input").val();
		let pw = $("#login-password-input").val();

		if (!username || username === "") {
			// isUsernameError = true;
			$("#login-username-input-field").addClass("error");
			return;
		}
		if ((!username || username === "") || (!pw || pw === "")) {
			// isPasswordError = true;
			$("#login-password-input-field").addClass("error");
			return;
		}
		$.ajax({
			url: generateUrl(username, pw, "login"),
			type: "GET",
			success: function (response) {
				response = JSON.parse(response);
				if (response.isValid) {
					document.cookie = "token=" + response.token + ";";
					$(location).attr('href', '/photo');
				} else {
					// isPasswordError = true;
					// isUsernameError = true;
					$("#login-username-input-field").addClass("error");
					$("#login-password-input-field").addClass("error");
					alert(response.message);
				}
				// console.log(response);
			},
		})

	};

	let sendSigUp = () => {
		let username = $("#signup-username-input").val();
		let pw = $("#signup-password-input").val();
		let pwAgain = $("#signup-confirm-password-input").val();

		if (!username || username === "") {
			$("#signup-username-input-field").addClass("error");
			return;
		}

		if ((!username || username === "") || (!pw || pw === "")) {
			$("#signup-password-input-field").addClass("error");
			return;
		}

		if ((!username || username === "") || (!pw && pw === "") || (!pwAgain && pwAgain === "")) {
			$("#signup-confirm-password-input-field").addClass("error");
			return;
		}

		if (pw !== pwAgain) {
			$("#signup-confirm-password-input-field").addClass("error");
			return;
		}
		$.ajax({
			url: generateUrl(username, pw, "signup"),
			type: "POST",
			success: function (response) {
				console.log(response);
				response = JSON.parse(response);
				console.log(response);
				if (response.isValid) {
					enableLoginForm();
					disableSignupForm();
				} else {
					alert(response["message"]);
				}
			}
		})

	};

	let disableError = () => {
		let loginUsername = $("#login-username-input-field");
		let loginPassword = $("#login-password-input-field");
		let signUpUsername = $("#signup-username-input-field");
		let signUpPassword = $("#signup-password-input-field");
		let signUpConfirmPassword = $("#signup-confirm-password-input-field");
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
	};

	let setEventListenr = () => {
		$("#to-login").click((e) => {
			e.preventDefault();
			enableLoginForm();
			disableSignupForm();
		});

		$("#to-sign-up").click((e) => {
			console.log("to sign up");
			e.preventDefault();
			enableSignupForm();
			disableLoginForm();
		});

		$("#login-confirm").click((e) => {
			console.log("click login confirm");
			e.preventDefault();
			sendLogin();
		});

		$("#signup-confirm").click((e) => {
			e.preventDefault();
			sendSigUp();
		});

		$("#login-password-input").on("input", (e) => {
			e.preventDefault();
			disableError();
		});
		$("#login-username-input").on("input", (e) => {
			e.preventDefault();
			disableError();
		});
		$("#signup-username-input").on("input", (e) => {
			e.preventDefault();
			disableError();
		});
		$("#signup-password-input").on("input", (e) => {
			e.preventDefault();
			disableError();
		});
		$("#signup-password-input").on("input", (e) => {
			e.preventDefault();
			disableError();
		});
		$("#signup-confirm-password-input").on("input", (e) => {
			e.preventDefault();
			disableError();
		})
	};

	setEventListenr();
	disableSignupForm();
};