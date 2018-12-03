let main = () => {
	/*========圖片相關的常量========*/
	const DEFAULT_IMAGE_SRC = "./../images/1.jpg";
	const IMAGES_NUM = 9;
	const DEFAULT_IMAGE_OFFSET = {
		x: 0,
		y: 0
	};
	const EACH_IMAGE_MOVE_PX = 5;
	/*============================*/

	/*========合成相關的常量========*/
	const DEFAULT_COMPOSITION_POSITION = {
		x: 150,
		y: 150
	};
	const DEFAULT_COMPOSITION_OFFEST = {
		x: 0,
		y: 0
	};
	const EACH_COMPOSITION_MOVE_PX = 5;
	/*============================*/


	/*========繪畫相關的常量========*/
	const DEFAULT_COLOR = "black";
	/*============================*/

	/*========文字相關的常量========*/
	const DEFAULT_TEXT_LOCATION = {
		x: 150,
		y: 150
	};
	const EACH_TEXT_MOVE_PX = 5;
	/*=============================*/

	/*========放大縮小相關的常量========*/
	const BIGGER_STEP = 0.1;
	const BIG_MAX = 3.0;
	const SMALLER_STEP = 0.1;
	const SMALL_MIN = 0.1;
	/*================================*/

	/*========濾鏡相關效果========*/
	const FILTER_BLACK = "black";
	const FILTER_BLUR = "blur";
	const FILTER_REVERSE = "reverse";
	const FILTER_GREY = "grey";
	const FILTER_MOSAIC = "mosaic";
	/*==========================*/

	let canvas = $("#canvas")[0];
	let context = canvas.getContext("2d");
	let textCanvas = $("#text-canvas")[0];
	let textCanvasContext = textCanvas.getContext("2d");
	let compositionCanvas = $("#composition-canvas")[0];
	let compositionCanvasContext = compositionCanvas.getContext("2d");
	let currentImageSrc = DEFAULT_IMAGE_SRC;
	let moveButtonList = [{
			buttons: [$("#op-text-move-up"), $("#op-text-move-down"), $("#op-text-move-left"), $("#op-text-move-right")],
			type: "text"
		},
		{
			buttons: [$("#op-image-move-up"), $("#op-image-move-down"), $("#op-image-move-left"), $("#op-image-move-right")],
			type: "image"
		},
		{
			buttons: [$("#op-composition-move-up"), $("#op-composition-move-down"), $("#op-composition-move-left"), $("#op-composition-move-right")],
			type: "composition"
		}
	];
	let filterButtonList = [{
			button: $("#op-filter-mosaic"),
			type: "mosaic"
		},
		{
			button: $("#op-filter-gray"),
			type: "grey"
		},
		{
			button: $("#op-filter-reverse"),
			type: "reverse"
		},
		{
			button: $("#op-filter-blur"),
			type: "blur"
		},
		{
			button: $("#op-filter-black"),
			type: "black"
		},
	];

	/*========以下變量需每次換圖片時重置========*/
	let imageScale = 1.0;
	let isPencilEnabled = false;
	let strokePointList = [];
	let isSave = false;
	let isEdited = false;
	let filterAdded = [];
	let isMouseDown = false;
	let isCompositionMode = false;
	let currentTextLocation = DEFAULT_TEXT_LOCATION;
	let currentColor = DEFAULT_COLOR;
	let currentImageDrawOffset = DEFAULT_IMAGE_OFFSET;
	let currentCompositionDrawOffset = DEFAULT_COMPOSITION_OFFEST;
	let currentCompositionImageSrc = DEFAULT_IMAGE_SRC;
	/*======================================*/

	canvas.width = 600;
	canvas.height = 800;

	textCanvas.width = canvas.width;
	textCanvas.height = canvas.height;

	compositionCanvas.width = canvas.width;
	compositionCanvas.height = canvas.height;

	let windowToCanvas = (x, y) => {
		let bbox = canvas.getBoundingClientRect();
		return {
			x: x - bbox.left,
			y: y - bbox.top
		}
	};

	let drawImage = (imageSrc) => {
		let image = new Image();
		image.src = imageSrc;
		image.onload = () => {
			context.drawImage(image, 0, 0, canvas.width, canvas.height);
		}
	};

	let drawImageWithScale = (currentImage, scale) => {
		let imageWidth = currentImage.width * scale;
		let imageHeight = currentImage.height * scale;

		let dx = canvas.width / 2 - imageWidth / 2;
		let dy = canvas.height / 2 - imageHeight / 2;

		context.clearRect(0, 0, canvas.width, canvas.height);
		context.drawImage(currentImage, dx + currentImageDrawOffset.x, dy + currentImageDrawOffset.y, imageWidth, imageHeight);
	};

	let drawImageWithOtherCanvas = (otherCanvasList, scale) => {
		// console.log("drawing");
		loadCurrentImage((image) => {
			drawImageWithScale(image, scale);
			for (let c of otherCanvasList) {
				context.drawImage(c, canvas.width - c.width,
					canvas.height - c.height);
			}
			if (strokePointList && strokePointList.length !== 0)
				drawStroke(strokePointList);
			if (filterAdded && filterAdded.length !== 0) {
				for (let i = 0; i < filterAdded.length; i++) {
					switch (filterAdded[i]) {
						case FILTER_BLACK:
							opFilterBlack();
							break;
						case FILTER_MOSAIC:
							opFilterMosaic();
							break;
						case FILTER_GREY:
							opFilterGrey();
							break;
						case FILTER_BLUR:
							opFilterBlur();
							break;
						case FILTER_REVERSE:
							opFilterReverse();
							break;
						default:
							throw new Error("unknown filter type");
					}
				}
			}
		});
	};

	let drawStroke = (points) => {
		let color;
		let isNew = false;
		for (let i = 0; i < points.length; i++) {
			if (typeof points[i] === "string") {
				context.closePath();
				color = points[i];
				isNew = true;
			} else if (isNew) {
				context.strokeStyle = color;
				context.beginPath();
				context.moveTo(points[i].x, points[i].y);
				isNew = false;
			} else {
				context.lineTo(points[i].x, points[i].y);
				context.stroke();
			}
		}
	};

	let opBigger = (e) => {
		e.preventDefault();
		// console.log("bigger");
		imageScale = imageScale + BIGGER_STEP;
		if (imageScale >= BIG_MAX)
			imageScale = BIG_MAX;
		else if (imageScale <= SMALL_MIN)
			imageScale = SMALL_MIN;
		drawImageWithOtherCanvas([textCanvas, compositionCanvas], imageScale);
		// drawImageWithOtherCanvas(compositionCanvas, imageScale);
	};

	let opSmaller = (e) => {
		e.preventDefault();
		// console.log("smaller");
		imageScale = imageScale - SMALLER_STEP;
		if (imageScale >= BIG_MAX)
			imageScale = BIG_MAX;
		else if (imageScale <= SMALL_MIN)
			imageScale = SMALL_MIN;
		drawImageWithOtherCanvas([textCanvas, compositionCanvas], imageScale);
	};

	let loadCurrentImage = (callback) => {
		let image = new Image();
		image.src = currentImageSrc;
		image.onload = () => {
			callback(image)
		};
	};

	let opText = (e) => {
		e.preventDefault();
		const content = $("#op-text-content").val();
		const fontSize = $("#op-text-size").val();

		if (isNaN(parseInt(fontSize)))
			return;

		textCanvasContext.clearRect(0, 0, textCanvas.width, textCanvas.height);
		textCanvasContext.font = "bold " + fontSize + "px Arial";
		textCanvasContext.lineWidth = "1";
		textCanvasContext.fillStyle = currentColor;
		textCanvasContext.textBaseline = "middle";
		textCanvasContext.fillText(content, currentTextLocation.x, currentTextLocation.y);
		drawImageWithOtherCanvas([textCanvas, compositionCanvas], imageScale);
		// console.log(content, fontSize);
	};

	let opTextMoveDown = (e) => {
		e.preventDefault();
		currentTextLocation.y += EACH_TEXT_MOVE_PX;
		opText(e);
	};

	let opTextMoveUp = (e) => {
		e.preventDefault();
		currentTextLocation.y -= EACH_TEXT_MOVE_PX;
		opText(e);
	};

	let opTextMoveRight = (e) => {
		e.preventDefault();
		currentTextLocation.x += EACH_TEXT_MOVE_PX;
		opText(e);
	};

	let opTextMoveLeft = (e) => {
		e.preventDefault();
		currentTextLocation.x -= EACH_TEXT_MOVE_PX;
		opText(e);
	};

	let opSave = (e) => {
		e.preventDefault();
		let image = canvas.toDataURL("image/png");
		let save_link = document.createElement('a');
		save_link.href = image;
		save_link.download = 'download.png';
		let clickevent = document.createEvent('MouseEvents');
		clickevent.initEvent('click', true, false);
		save_link.dispatchEvent(clickevent);
		isSave = true;
	};

	let opPencil = (e) => {
		e.preventDefault();
		isPencilEnabled = !isPencilEnabled;
	};

	let setUpCanvasPencilEvent = () => {
		// console.log("find me");
		canvas.addEventListener("mousedown", onMouseDown);
		canvas.addEventListener("mouseout", onMouseUp);
		canvas.addEventListener("mouseup", onMouseUp);
		canvas.addEventListener("mousemove", onMouseMove);
	};

	let onMouseDown = (e) => {
		if (isPencilEnabled === false)
			return;
		e.preventDefault();
		// console.log("mouse down");
		isMouseDown = true;
		context.strokeStyle = currentColor;
		let point = windowToCanvas(e.clientX, e.clientY);
		strokePointList.push(currentColor);
		strokePointList.push(point);
		context.beginPath();
		context.moveTo(point.x, point.y);
	};

	let onMouseMove = (e) => {
		if (isPencilEnabled === false)
			return;
		e.preventDefault();
		if (isMouseDown) {
			// console.log("mouse move");
			let point = windowToCanvas(e.clientX, e.clientY);
			strokePointList.push(point);
			context.lineTo(point.x, point.y);
			context.stroke();
		}
	};

	let onMouseUp = (e) => {
		if (isPencilEnabled === false)
			return;
		e.preventDefault();
		if (isMouseDown) {
			// console.log("mouse up");
			let point = windowToCanvas(e.clientY, e.clientY);
			strokePointList.push(point);
			isMouseDown = false;
			context.stroke();
			context.closePath();
		}
	};

	let opReset = (e) => {
		e.preventDefault();
		onImageChange(e, currentImageSrc);
	};

	let onImageChange = (e, imageSrc) => {
		e.preventDefault();

		if (isCompositionMode) {
			currentCompositionImageSrc = imageSrc;
			doComposition(imageSrc);
			return;
		}

		if (isEdited === true && isSave === false) {
			let response = remind("This image has not properly saved!");
			// console.log(response);
			if (response === false)
				return;
		}

		drawImage(imageSrc);
		// console.log("change to " + imageSrc);
		currentImageSrc = imageSrc;
		imageScale = 1.0;
		textCanvasContext.clearRect(0, 0, textCanvasContext.width, textCanvasContext.height);
		strokePointList = [];
		isSave = false;
		isEdited = false;
		isMouseDown = false;
		filterAdded = [];
		currentColor = DEFAULT_COLOR;
		currentTextLocation = DEFAULT_TEXT_LOCATION;
		currentImageDrawOffset = DEFAULT_IMAGE_OFFSET;
		currentCompositionDrawOffset = DEFAULT_COMPOSITION_OFFEST;
	};

	let remind = (msg) => {
		let response = confirm(msg);
		return response;
	};

	let beforeOperationStart = () => {
		// nothing to do
	};

	let afterOperationEnd = () => {
		isEdited = true;
	};

	let opFilterBlack = (e) => {
		e.preventDefault();
		// console.log("filter black");
		let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
		let pixelData = imageData.data;
		for (let i = 0; i < canvas.width * canvas.height; i++) {

			let r = pixelData[i * 4 + 0];
			let g = pixelData[i * 4 + 1];
			let b = pixelData[i * 4 + 2];
			let pv;
			let grey = r * 0.3 + g * 0.59 + b * 0.11;
			if (grey > 192) {
				pv = 255
			} else {
				pv = 0
			}

			pixelData[i * 4 + 0] = pv;
			pixelData[i * 4 + 1] = pv;
			pixelData[i * 4 + 2] = pv;
		}

		context.putImageData(imageData, 0, 0, 0, 0, canvas.width, canvas.height);
		filterAdded.push(FILTER_BLACK);
	};

	let opFilterReverse = (e) => {
		e.preventDefault();
		let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
		let pixelData = imageData.data;
		for (let i = 0; i < canvas.width * canvas.height; i++) {

			let r = pixelData[i * 4 + 0];
			let g = pixelData[i * 4 + 1];
			let b = pixelData[i * 4 + 2];

			pixelData[i * 4 + 0] = 255 - r;
			pixelData[i * 4 + 1] = 255 - g;
			pixelData[i * 4 + 2] = 255 - b;
		}

		context.putImageData(imageData, 0, 0, 0, 0, canvas.width, canvas.height);
		filterAdded.push(FILTER_REVERSE)
	};

	let opFilterBlur = (e) => {
		e.preventDefault();

		let tmpImageData = context.getImageData(0, 0, canvas.width, canvas.height);
		let tmpPixelData = tmpImageData.data;

		let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
		let pixelData = imageData.data;

		let blurR = 3;
		let totalnum = (2 * blurR + 1) * (2 * blurR + 1);

		for (let i = blurR; i < canvas.height - blurR; i++)
			for (let j = blurR; j < canvas.width - blurR; j++) {

				let totalr = 0,
					totalg = 0,
					totalb = 0;
				for (let dx = -blurR; dx <= blurR; dx++)
					for (let dy = -blurR; dy <= blurR; dy++) {

						let x = i + dx;
						let y = j + dy;

						let p = x * canvas.width + y;
						totalr += tmpPixelData[p * 4 + 0];
						totalg += tmpPixelData[p * 4 + 1];
						totalb += tmpPixelData[p * 4 + 2]
					}

				let p = i * canvas.width + j;
				pixelData[p * 4 + 0] = totalr / totalnum;
				pixelData[p * 4 + 1] = totalg / totalnum;
				pixelData[p * 4 + 2] = totalb / totalnum;
			}

		context.putImageData(imageData, 0, 0, 0, 0, canvas.width, canvas.height);
		filterAdded.push(FILTER_BLUR);
	};

	let opFilterGrey = (e) => {
		e.preventDefault();
		let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
		let pixelData = imageData.data;
		for (let i = 0; i < canvas.width * canvas.height; i++) {

			let r = pixelData[i * 4 + 0];
			let g = pixelData[i * 4 + 1];
			let b = pixelData[i * 4 + 2];

			let grey = r * 0.3 + g * 0.59 + b * 0.11;

			pixelData[i * 4 + 0] = grey;
			pixelData[i * 4 + 1] = grey;
			pixelData[i * 4 + 2] = grey
		}

		context.putImageData(imageData, 0, 0, 0, 0, canvas.width, canvas.height);
		// context.putImageData()
		filterAdded.push(FILTER_GREY);
	};

	let opFilterMosaic = (e) => {
		e.preventDefault();
		let tmpImageData = context.getImageData(0, 0, canvas.width, canvas.height);
		let tmpPixelData = tmpImageData.data;

		let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
		let pixelData = imageData.data;

		let size = 16;
		let totalnum = size * size;
		for (let i = 0; i < canvas.height; i += size)
			for (let j = 0; j < canvas.width; j += size) {

				let totalr = 0,
					totalg = 0,
					totalb = 0;
				for (let dx = 0; dx < size; dx++)
					for (let dy = 0; dy < size; dy++) {

						let x = i + dx;
						let y = j + dy;

						let p = x * canvas.width + y;
						totalr += tmpPixelData[p * 4 + 0];
						totalg += tmpPixelData[p * 4 + 1];
						totalb += tmpPixelData[p * 4 + 2];
					}

				let p = i * canvas.width + j;
				let resr = totalr / totalnum;
				let resg = totalg / totalnum;
				let resb = totalb / totalnum;

				for (let dx = 0; dx < size; dx++)
					for (let dy = 0; dy < size; dy++) {

						let x = i + dx;
						let y = j + dy;

						let p = x * canvas.width + y;
						pixelData[p * 4 + 0] = resr;
						pixelData[p * 4 + 1] = resg;
						pixelData[p * 4 + 2] = resb;
					}
			}
		context.putImageData(imageData, 0, 0, 0, 0, canvas.width, canvas.height);
		filterAdded.push(FILTER_MOSAIC);
	};

	let opColorPicker = (e) => {
		e.preventDefault();
		let color = $("#op-color-picker").val();
		currentColor = color;
	};

	let opImageMoveDown = (e) => {
		e.preventDefault();
		currentImageDrawOffset.y += EACH_IMAGE_MOVE_PX;
		drawImageWithOtherCanvas([textCanvas, compositionCanvas], imageScale);
	};

	let opImageMoveUp = (e) => {
		e.preventDefault();
		currentImageDrawOffset.y -= EACH_IMAGE_MOVE_PX;
		drawImageWithOtherCanvas([textCanvas, compositionCanvas], imageScale);

	};

	let opImageMoveLeft = (e) => {
		e.preventDefault();
		currentImageDrawOffset.x -= EACH_IMAGE_MOVE_PX;
		drawImageWithOtherCanvas([textCanvas, compositionCanvas], imageScale);

	};

	let opImageMoveRight = (e) => {
		e.preventDefault();
		currentImageDrawOffset.x += EACH_IMAGE_MOVE_PX;
		drawImageWithOtherCanvas([textCanvas, compositionCanvas], imageScale);
	};

	let opComposition = (e) => {
		e.preventDefault();
		isCompositionMode = true;
	};

	let doComposition = (imageSrc) => {
		let image = new Image();
		image.src = imageSrc;
		image.onload = function () {
			// console.log(currentCompositionDrawOffset);
			compositionCanvasContext.clearRect(0, 0, compositionCanvas.width, compositionCanvas.height);
			compositionCanvasContext.drawImage(image, DEFAULT_COMPOSITION_POSITION.x -
				currentCompositionDrawOffset.x, DEFAULT_COMPOSITION_POSITION.y - currentCompositionDrawOffset.y,
				image.width / 2, image.height / 2);
			isCompositionMode = false;
			drawImageWithOtherCanvas([textCanvas, compositionCanvas], imageScale);
		};

	};

	let opCompositionMoveUp = (e) => {
		// console.log("up");
		e.preventDefault();
		currentCompositionDrawOffset.y += EACH_COMPOSITION_MOVE_PX;
		doComposition(currentCompositionImageSrc);
	};

	let opCompositionMoveDown = (e) => {
		e.preventDefault();
		currentCompositionDrawOffset.y -= EACH_COMPOSITION_MOVE_PX;
		doComposition(currentCompositionImageSrc);
	};
	let opCompositionMoveLeft = (e) => {
		e.preventDefault();
		currentCompositionDrawOffset.x += EACH_COMPOSITION_MOVE_PX;
		doComposition(currentCompositionImageSrc);
	};
	let opCompositionMoveRight = (e) => {
		e.preventDefault();
		currentCompositionDrawOffset.x -= EACH_COMPOSITION_MOVE_PX;
		doComposition(currentCompositionImageSrc);
	};

	let enableMoveButtons = (buttonType) => {
		for (let buttons of moveButtonList) {
			if (buttons.type === buttonType) {
				for (let button of buttons.buttons) {
					button.css({
						display: "inline"
					})
				}
			} else {
				for (let button of buttons.buttons) {
					button.css({
						display: "none"
					})
				}
			}
		}
	};

	let enableFilterButton = (e) => {
		// console.log("debug here");
		e.preventDefault();
		for (let button of filterButtonList) {
			button.button.css({
				display: "inline"
			});
		}
	};

	let opUploadImage = (e) => {
		e.preventDefault();
		//判断是否支持FileReader
		let selectedFiles = $('#op-upload')[0].files;
		let uploadOneImage = (selectedFile) => {
			let reader = new FileReader();
			//读取完成
			reader.onload = function (e) {
				let base64Image = e.target.result;
				// console.log(base64Image);
				// isCompositionMode = true;
				// doComposition(base64Image);
				insertImage(base64Image);
				// insertImage(base64Image);
				$.post("http://127.0.0.1:3000/upload/image", {
					image: base64Image
				})
			};
			reader.readAsDataURL(selectedFile);
		}

		for (let selectedFile of selectedFiles) {
			console.log("upload " + selectedFile);
			uploadOneImage(selectedFile);
		}
	};

	let insertImage = (base64Image) => {
		let thumbnailList = $(".thumbnail-list")[0];
		let thumbnailItems = $(".thumbnail-item");
		// console.log(thumbnailList.innerHTML);
		let imageNumber = thumbnailItems.length + 1;
		let newLi = document.createElement("li");
		newLi.classList.add("thumbnail-item");
		let newA = document.createElement("a");
		newA.setAttribute("id", imageNumber);
		newA.setAttribute("href", base64Image);
		let newImg = document.createElement("img");
		newImg.classList.add("thumbnail-image");
		newImg.setAttribute("src", base64Image);

		newA.appendChild(newImg);
		newLi.appendChild(newA);


		thumbnailList.appendChild(newLi);
		console.log(thumbnailList.innerHTML)

		// console.log(imageNumber);
		// let newImageHtml = '<li class="thumbnail-item">\n' +
		// 	'\t\t\t<a id="' + imageNumber + '" href="' + base64Image + '">\n' +
		// 	'\t\t\t\t<img class="thumbnail-image" src="' + base64Image + '" alt="Barbara the Otter">\n' +
		// 	'\t\t\t</a>\n' +
		// 	'\t\t</li>';
		// setEventListener();
		$('#' + imageNumber).click((e) => {
			let imageSrc = $(".thumbnail-image")[imageNumber - 1].src;
			onImageChange(e, imageSrc);
		});
		// thumbnailList.innerHTML += newImageHtml;
		// let image = new Image();
		// image.src = base64Image;
		// image.onload = () => {
		// 	let newImageHtml = '<li class="thumbnail-item">\n' +
		// 		'\t\t\t<a id="9" href="./../images/' + thumbnailItems.length + '.jpg">\n' +
		// 		'\t\t\t\t<img class="thumbnail-image" src="' + base64Image + '" alt="Barbara the Otter">\n' +
		// 		'\t\t\t</a>\n' +
		// 		'\t\t</li>'
		// }
	};

	let disableAllButtons = () => {
		// console.log(this);
		for (let buttons of moveButtonList) {
			for (let button of buttons.buttons) {
				button.css({
					display: "none"
				})
			}
		}
		for (let button of filterButtonList) {
			button.button.css({
				display: "none"
			})
		}
	};

	let setEventListener = () => {
		for (let i = 1; i <= IMAGES_NUM; i++) {
			let id = i - 1;
			$('#' + i).click((e) => {
				let imageSrc = $(".thumbnail-image")[id].src;
				onImageChange(e, imageSrc)
			});
		}
		$("#op-bigger").click((e) => {
			beforeOperationStart();
			enableMoveButtons("image");
			opBigger(e);
			afterOperationEnd();
		});
		$("#op-smaller").click((e) => {
			beforeOperationStart();
			enableMoveButtons("image");
			opSmaller(e);
			afterOperationEnd();
		});
		$("#op-text").click((e) => {
			beforeOperationStart();
			opText(e);
			enableMoveButtons("text");
			afterOperationEnd();
		});
		$("#op-save").click((e) => {
			beforeOperationStart();
			opSave(e);
			afterOperationEnd();
		});
		$("#op-pencil").click((e) => {
			beforeOperationStart();
			opPencil(e);
			setUpCanvasPencilEvent();
			afterOperationEnd();
		});
		$("#op-reset").click((e) => {
			beforeOperationStart();
			opReset(e);
			afterOperationEnd();
		});
		$("#op-filter-black").click((e) => {
			beforeOperationStart();
			opFilterBlack(e);
			afterOperationEnd();
		});
		$("#op-filter-blur").click((e) => {
			beforeOperationStart();
			opFilterBlur(e);
			afterOperationEnd();
		});
		$("#op-filter-reverse").click((e) => {
			beforeOperationStart();
			opFilterReverse(e);
			afterOperationEnd();
		});
		$("#op-filter-gray").click((e) => {
			beforeOperationStart();
			opFilterGrey(e);
			afterOperationEnd();
		});
		$("#op-filter-mosaic").click((e) => {
			beforeOperationStart();
			opFilterMosaic(e);
			afterOperationEnd();
		});
		$("#op-text-move-down").click((e) => {
			beforeOperationStart();
			opTextMoveDown(e);
			afterOperationEnd();
		});
		$("#op-text-move-up").click((e) => {
			beforeOperationStart();
			opTextMoveUp(e);
			afterOperationEnd();
		});
		$("#op-text-move-right").click((e) => {
			beforeOperationStart();
			opTextMoveRight(e);
			afterOperationEnd();
		});
		$("#op-text-move-left").click((e) => {
			beforeOperationStart();
			opTextMoveLeft(e);
			afterOperationEnd();
		});
		$("#op-color-picker").on("change", (e) => {
			opColorPicker(e);
		});
		$("#op-image-move-down").click((e) => {
			beforeOperationStart();
			opImageMoveDown(e);
			afterOperationEnd();
		});
		$("#op-image-move-up").click((e) => {
			beforeOperationStart();
			opImageMoveUp(e);
			afterOperationEnd();
		});
		$("#op-image-move-left").click((e) => {
			beforeOperationStart();
			opImageMoveLeft(e);
			afterOperationEnd();
		});
		$("#op-image-move-right").click((e) => {
			beforeOperationStart();
			opImageMoveRight(e);
			afterOperationEnd();
		});
		$("#op-composition").click((e) => {
			beforeOperationStart();
			enableMoveButtons("composition");
			opComposition(e);
			afterOperationEnd();
		});
		$("#op-composition-move-left").click((e) => {
			beforeOperationStart();
			opCompositionMoveLeft(e);
			afterOperationEnd();
		});
		$("#op-composition-move-right").click((e) => {
			beforeOperationStart();
			opCompositionMoveRight(e);
			afterOperationEnd();
		});
		$("#op-composition-move-down").click((e) => {
			beforeOperationStart();
			opCompositionMoveDown(e);
			afterOperationEnd();
		});
		$("#op-composition-move-up").click((e) => {
			beforeOperationStart();
			opCompositionMoveUp(e);
			afterOperationEnd();
		});
		$("#op-filter").click((e) => {
			enableFilterButton(e);
		});
		$("#op-upload").on("change", (e) => {
			beforeOperationStart();
			opUploadImage(e);
			afterOperationEnd();
		});
		$("#logout-button").click(function () {
			$.ajax({
				url: "http://localhost:3000/logout",
				type: "GET",
				success: function (response) {
					response = JSON.parse(response);
					console.log(response);
					if (response.isValid) {
						document.cookie = "token=" + response.token + ";";
						$(location).attr('href', '/');
					}
				}
			})
		})
	};

	disableAllButtons();
	drawImage(DEFAULT_IMAGE_SRC);
	setEventListener()
};