
//  初始化jsPsych对象
const jsPsych = initJsPsych({
    on_finish: function () {
        jsPsych.data.get().localSave('csv', 'exp3_' + info["ID"] + '.csv');
        document.exitFullscreen();
        let bodyNode = document.getElementsByTagName("body");
    }
});

// 不重复的排列组合函数，输入需排列的数组与个数
function permutation(arr, num) {
    var r = [];
    (function f(t, a, n) {
        if (n == 0) return r.push(t);
        for (var i = 0, l = a.length; i < l; i++) {
            // 递归调用f
            f(t.concat(a[i]), a.slice(0, i).concat(a.slice(i + 1)), n - 1);
        }
    })([], arr, num);//传入[], arr, num调用f递归函数
    return r;
}

// 时间线
var timeline = []



// 图片刺激
//var images = [
//    '../../img/C_28.png',
//    '../../img/S_28.png',
//    '../../img/H_28.png']

var images = [
    '../../img/10.png',
    '../../img/25.png',
    '../../img/8.png',
]

// 预加载实验刺激
var preload = {
    type: jsPsychPreload,
    images: images,
}
timeline.push(preload);

// 标签
var texts = ["自我", "朋友", "生人"]
var Lable = ["自我图形类", "非自我图形"]
// var LeftLable = ["自我", "朋友", "生人"]
// var RightLable = ["非自我", "非朋友", "非生人"]
// var key_m = ['f', 'j']//matching task 按键
var key_match = ['arrowleft', 'arrowright']
var key_classify = ['arrowleft', 'arrowright']//分类任务按键，固定左为yes,右为no
let acc = 70;//正确率70%
let view_texts_images = [];


// 存储images和texts之间的对应关系
var myMap = new Map();

// 欢迎语
var welcome = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
     <p>您好，欢迎参加本次实验。</p>
     <p>为充分保障您的权利，请确保您已经知晓并同意《参与实验同意书》以及《数据公开知情同意书》。</p>
     <p>如果您未见过上述内容，请咨询实验员。</p>
     <p>如果您选择继续实验，则表示您已经清楚两份知情同意书的内容并同意。</p>
     <p> <div style = "color: green"><按任意键至下页></div> </p>
     `,
    choices: "ALL_KEYS",
};
timeline.push(welcome);


// 基本信息指导语
var basic_information = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
     <p>本实验首先需要您填写一些基本个人信息。</p>
     <p> <div style = "color: green"><按任意键至下页></div></p>
     `,
    choices: "ALL_KEYS",
};
timeline.push(basic_information);

// 存储被试信息：ID
var info = []

//方便测试
// info["ID"] = 123;
// 使用 permutation函数和参与者的ID来随机化实验材料，
// images = permutation(images, 3)[parseInt(info["ID"]) % 6]//变整取余，提取组合
// key = permutation(key, 2)[parseInt(info["ID"]) % 2]


/* basic data collection jsPsychInstructions trial 被试基本信息收集与根据ID随机化 */
var information = {
    timeline: [
        {//探测被试显示器数据
            type: jsPsychCallFunction,
            func: function () {
                if ($(window).outerHeight() < 500) {
                    alert("您设备不支持实验，请退出全屏模式。若已进入全屏，请换一台高分辨率的设备，谢谢。");
                    window.location = "";
                }
            }
        },
        {// 收集被试信息
            type: jsPsychSurveyHtmlForm,
            preamble: "<p style =' color : white'>您的实验编号是</p>",
            html: function () {
                let data = localStorage.getItem(info["subj_idx"]) ? JSON.parse(localStorage.getItem(info["subj_idx"]))["Name"] : "";
                return "<p><input name='Q0' type='text' value='" + data + "' required/></p>";
            },
            button_label: "继续",
            on_finish: function (data) {
                info["ID"] = data.response.Q0;

                // 使用被试ID随机化实验材料
                images = permutation(images, 3)[parseInt(info["ID"]) % 6]
                word = permutation(texts, 3) //label
                key_match = permutation(key_match, 2)[parseInt(info["ID"]) % 2] //matching task key

                // 在指导语中显示按键的中文字符
                key_match_chinese = []
                for (var i = 0; i < key_match.length; i++) {
                    // 检查当前元素
                    if (key_match[i] === 'arrowleft') {
                        key_match_chinese.push('左键');
                    } else if (key_match[i] === 'arrowright') {
                        // 如果是'b'，则添加'右键'到key_match_chinese
                        key_match_chinese.push('右键');
                    }
                }

                // 呈现shape-label联接
                view_texts_images = []
                jsPsych.randomization.shuffle(images).forEach((v, i) => {
                    view_texts_images.push(`<img src="${v}" width=150 style="vertical-align:middle">---${texts[images.indexOf(v)]}`);
                    console.log(view_texts_images)
                    myMap.set(v, `${texts[images.indexOf(v)]}`);
                })
                console.log(key_match);
            }
        },
        {//收集性别
            type: jsPsychHtmlButtonResponse,
            stimulus: "<p style = 'color : white'>您的性别</p>",
            choices: ['男', '女', '其他'],
            on_finish: function (data) {
                info["Sex"] = data.response == 0 ? "Male" : (data.response == 1 ? "Female" : "Other")
            }
        },
        {//收集出生年
            type: jsPsychSurveyHtmlForm,
            preamble: "<p style = 'color : white'>您的出生年</p>",
            html: function () {
                let data = localStorage.getItem(info["subj_idx"]) ? JSON.parse(localStorage.getItem(info["subj_idx"]))["BirthYear"] : "";
                return `<p>
        <input name="Q0" type="number" value=${data} placeholder="1900~2023" min=1900 max=2023 oninput="if(value.length>4) value=value.slice(0,4)" required />
        </p>`
            },
            button_label: '继续',
            on_finish: function (data) {
                info["BirthYear"] = data.response.Q0;
            }
        },
        {//收集教育经历
            type: jsPsychSurveyHtmlForm,
            preamble: "<p style = 'color : white'>您的教育经历是</p>",
            html: function () {
                return `
                <p><select name="Q0" size=10>
                <option value=1>小学以下</option>
                <option value=2>小学</option>
                <option value=3>初中</option>
                <option value=4>高中</option>
                <option value=5>大学</option>
                <option value=6>硕士</option>
                <option value=7>博士</option>
                <option value=8>其他</option>
                </select></p>`
            },
            on_load: function () {
                $("option[value=" + (["below primary school", "primary school", "junior middle school", "high school", "university", "master", "doctor", "other"].indexOf(localStorage.getItem(info["subj_idx"]) ? JSON.parse(localStorage.getItem(info["subj_idx"]))["Education"] : "") + 1) + "]").attr("selected", true);
            },
            button_label: '继续',
            on_finish: function (data) {
                let edu = ["below primary school", "primary school", "junior middle school", "high school", "university", "master", "doctor", "other"];

                info["Education"] = edu[parseInt(data.response.Q0) - 1];
            }
        }
    ]
};

timeline.push(information);

// 测试被试和显示器之间的距离
var chinrest = {
    type: jsPsychVirtualChinrest,
    blindspot_reps: 3,
    resize_units: "deg",
    pixels_per_unit: 50,
    item_path: '../../img/card.png',
    adjustment_prompt: function () {
        let html = `<p style = "font-size: 28px">首先，我们将快速测量您的显示器上像素到厘米的转换比率。</p>`;
        html += `<p style = "font-size: 28px">请您将拿出一张真实的银行卡放在屏幕上方，单击并拖动图像的右下角，直到它与屏幕上的信用卡大小相同。</p>`;
        html += `<p style = "font-size: 28px">您可以使用与银行卡大小相同的任何卡，如会员卡或驾照，如果您无法使用真实的卡，可以使用直尺测量图像宽度至85.6毫米。</p>`;
        html += `<p style = "font-size: 28px"> 如果对以上操作感到困惑，请参考这个视频： <a href='https://www.naodao.com/public/stim_calibrate.mp4' target='_blank' style='font-size:24px'>参考视频</a></p>`;
        return html
    },
    blindspot_prompt: function () {
        return `<p style="text-align:left">现在，我们将快速测量您和屏幕之间的距离：<br>
      请把您的左手放在 空格键上<br>
      请用右手遮住右眼<br>
      请用您的左眼专注于黑色方块。将注意力集中在黑色方块上。<br>
      如果您已经准备好了就按下 空格键 ，这时红色的球将从右向左移动，并将消失。当球一消失，就请再按空格键<br>
      如果对以上操作感到困惑，请参考这个视频：<a href='https://www.naodao.com/public/stim_calibrate.mp4' target='_blank' style='font-size:24px'>参考视频</a><br>
      <a style="text-align:center">准备开始时，请按空格键。</a></p>`
    },
    blindspot_measurements_prompt: `剩余测量次数：`,
    on_finish: function (data) {
        console.log(data)
    },
    redo_measurement_button_label: `还不够接近，请重试`,
    blindspot_done_prompt: `是的`,
    adjustment_button_prompt: `图像大小对准后，请单击此处`,
    viewing_distance_report: `<p>根据您的反应，您坐在离屏幕<span id='distance-estimate' style='font-weight: bold;'></span> 的位置。<br>这大概是对的吗？</p> `,
};

timeline.push(chinrest)

// 进入全屏
var fullscreen_trial = {
    type: jsPsychFullscreen,
    fullscreen_mode: true,
    message: "<p><span class='add_' style='color:white; font-size: 35px;'> 实验需要全屏模式，实验期间请勿退出全屏。 </span></p >",
    button_label: " <span class='add_' style='color:black; font-size: 20px;'> 点击这里进入全屏</span>"
}

timeline.push(fullscreen_trial);

// 总指导语
var Instructions = {
    type: jsPsychInstructions,
    pages: function () {
        let start = "<p class='header' style = 'font-size: 35px'>请您记住如下对应关系:</p>",
            middle = "<p class='footer'  style = 'font-size: 35px'>如果对本实验还有不清楚之处，请立即向实验员咨询。</p>",
            end = "<p style = 'font-size: 35px; line-height: 30px;'>如果您记住了三个对应关系及按键规则，请点击 继续 </span></p><div>";
        let tmpI = "";
        view_texts_images.forEach(v => {
            tmpI += `<p class="content">${v}</p>`;
        });
        return ["<p class='header' style = 'font-size: 35px'>实验说明：</p><p style='color:white; font-size: 35px;line-height: 30px;'>您好,欢迎参加本实验。本次实验大约需要45分钟完成。</p><p style='color:white; font-size: 35px;'>在本实验中，您需要完成一个知觉匹配任务与一个图形分类任务。</p><p style='color:white; font-size: 35px;'>在任务开始前，您将学习三种几何图形与三种标签的对应关系。</p>",
            start + `<div class="box">${tmpI}</div>`,
            `<p class='footer' style='font-size: 35px; line-height: 30px;'>首先进行知觉匹配任务。</p>
      <p class='footer' style='font-size: 35px; line-height: 30px;'>在知觉匹配任务中，您的任务是判断几何图形与文字标签是否匹配，</p>
      <p class='footer' style='color:white; font-size: 35px;'>如果二者<span style="color: lightgreen;">匹配</span>，请按键盘 <span style="color: lightgreen; font-size:35px">${key_match_chinese[0]}</span></p>
      <p class='footer' style='color:white; font-size: 35px;'>如果二者<span style="color: lightgreen;">不匹配</span>，请按键盘<span style="color: lightgreen; font-size:35px"> ${key_match_chinese[1]}</p></span>
      <p class='footer' style='color:white; font-size: 22px;'>请在实验过程中将您右手的<span style="color: lightgreen;">食指和无名指</span>放在电脑键盘的相应键位上准备按键。</p></span>`,
            `<p style='color:white; font-size: 35px; line-height: 30px;'>接下来，您将进入知觉匹配任务的练习部分</p>
      <p class='footer' style='color:lightgreen; font-size: 35px;'>请您又快又准地进行按键。</p>
      <p style='color:white; font-size: 35px; line-height: 30px;'>通过练习后,您将进入知觉匹配任务的正式试验。</p>
      <p class='footer' style='color:white; font-size: 35px;'>正式试验分为5组,每组完成后会有休息时间。</p></span>`,
            middle + end];
    },
    show_clickable_nav: true,
    button_label_previous: " <span class='add_' style='color:black; font-size: 20px;'> 返回</span>",
    button_label_next: " <span class='add_' style='color:black; font-size: 20px;'> 继续</span>",
    on_load: () => {
        $("body").css("cursor", "default");
    },// 开始时鼠标出现
    on_finish: function () {
        $("body").css("cursor", "none");
    } //结束时鼠标消失
}
timeline.push(Instructions);

// 知觉匹配任务：练习阶段
var matching_prac = {
    timeline: [
        {
            type: jsPsychPsychophysics,
            stimuli: [
                {
                    obj_type: 'cross',
                    startX: "center", // location of the cross's center in the canvas
                    startY: "center",
                    line_length: 40, // pixels 视角：0.8° x 0.8°
                    line_width: 5,
                    line_color: 'white', // You can use the HTML color name instead of the HEX color.
                    show_start_time: 500,
                    show_end_time: 1100// ms after the start of the trial
                },
                {
                    obj_type: "image",
                    file: function () { return jsPsych.timelineVariable("Image")() },
                    startX: "center", // location of the cross's center in the canvas
                    startY: -200,//-250，目前参数肉眼等距
                    width: 190,  // 调整图片大小 视角：3.8° x 3.8°
                    heigth: 190, // 调整图片大小 视角：3.8° x 3.8°
                    show_start_time: 1000, // ms after the start of the trial
                    show_end_time: 1100,//出现50ms
                    origin_center: true
                },//上一组end时间减去下一组show时间就是空屏的100ms
                {
                    obj_type: 'text',
                    file: function () { return jsPsych.timelineVariable("word") },
                    startX: "center",
                    startY: 100, //140，图形和文字距离 与加号等距2度
                    content: function () {
                        return jsPsych.timelineVariable('word', true)();
                    },
                    font: `${80}px 'Arial'`, //字体和颜色设置 文字视角：3.6° x 1.6°
                    text_color: 'white',
                    show_start_time: 1000, // ms after the start of the trial
                    show_end_time: 1100,
                    origin_center: true
                }
            ],

            choices: ['arrowleft', 'arrowright'],
            response_start_time: 1000,//开始作答时间，第二个刺激开始计算
            trial_duration: 2500,//结束时间，一共作答时间持续1500ms
            data: function () { return jsPsych.timelineVariable("identify") },
            on_finish: function (data) {
                data.correct_response = jsPsych.timelineVariable("identify", true)();
                data.correct = data.correct_response == data.key_press;//0错1对
                data.Image = jsPsych.timelineVariable("Image", true)();
                data.word = jsPsych.timelineVariable('word', true)();
                data.condition = "prac_matching_task";
                data.shape = jsPsych.timelineVariable("shape", true)();
                data.association = view_texts_images;
            }
        },
        {
            data: {
                screen_id: "feedback_test"//这里为反馈
            },
            type: jsPsychHtmlKeyboardResponse,
            stimulus: function () {
                let keypress = jsPsych.data.get().last(1).values()[0].key_press; // 被试按键
                //let trial_keypress = jsPsych.data.get().last(1).values()[0].correct; //该trial正确的按键
                let time = jsPsych.data.get().last(1).values()[0].rt;
                let trial_correct_response = jsPsych.data.get().last(1).values()[0].correct_response;//该trial正确的按键
                if (time > 1500 || time === null) { //大于1500或为null为过慢
                    return "<span class='add_' style='color:yellow; font-size: 70px;'> 太慢! </span>"
                } else if (time < 200) { //小于两百为过快反应
                    return "<span style='color:yellow; font-size: 70px;'>过快! </span>"
                } else {
                    if (keypress == trial_correct_response) { //如果按键 == 正确按键
                        return "<span style='color:GreenYellow; font-size: 70px;'>正确! </span>"
                    }
                    else {
                        return "<span style='color:red; font-size: 70px;'>错误! </span>"
                    }
                }
            },

            choices: "NO_KEYS",
            trial_duration: 300,//300ms反馈
        }
    ],

    timeline_variables: [
        { Image: function () { return images[0] }, shape: function () { return texts[0] }, word: function () { return texts[0] }, identify: function () { return key_match[0] } },
        { Image: function () { return images[0] }, shape: function () { return texts[0] }, word: function () { return texts[0] }, identify: function () { return key_match[0] } },
        { Image: function () { return images[0] }, shape: function () { return texts[0] }, word: function () { return texts[1] }, identify: function () { return key_match[1] } },
        { Image: function () { return images[0] }, shape: function () { return texts[0] }, word: function () { return texts[2] }, identify: function () { return key_match[1] } },

        { Image: function () { return images[1] }, shape: function () { return texts[1] }, word: function () { return texts[0] }, identify: function () { return key_match[1] } },
        { Image: function () { return images[1] }, shape: function () { return texts[1] }, word: function () { return texts[1] }, identify: function () { return key_match[0] } },
        { Image: function () { return images[1] }, shape: function () { return texts[1] }, word: function () { return texts[1] }, identify: function () { return key_match[0] } },
        { Image: function () { return images[1] }, shape: function () { return texts[1] }, word: function () { return texts[2] }, identify: function () { return key_match[1] } },

        { Image: function () { return images[2] }, shape: function () { return texts[2] }, word: function () { return texts[0] }, identify: function () { return key_match[1] } },
        { Image: function () { return images[2] }, shape: function () { return texts[2] }, word: function () { return texts[1] }, identify: function () { return key_match[1] } },
        { Image: function () { return images[2] }, shape: function () { return texts[2] }, word: function () { return texts[2] }, identify: function () { return key_match[0] } },
        { Image: function () { return images[2] }, shape: function () { return texts[2] }, word: function () { return texts[2] }, identify: function () { return key_match[0] } },
    ],
    randomize_order: true,
    repetitions: 2,//2,练习设置24个trial
    on_load: () => {
        $("body").css("cursor", "none");
    },
    on_finish: function () {
         $("body").css("cursor", "default"); 
    }
}
// 知觉匹配任务：练习阶段反馈
var feedback_block_prac = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: function () {
        let trials = jsPsych.data.get().filter(
            [{ correct: true }, { correct: false }]
        ).last(24); //这里填入prac所有trial数
        let correct_trials = trials.filter({
            correct: true
        });
        let accuracy = Math.round(correct_trials.count() / trials.count() * 100);
        let rt = Math.round(correct_trials.select('rt').mean());
        return "<style>.context{color:white; font-size: 35px; line-height:40px}</style>\
                          <div><p class='context'>您正确回答了" + accuracy + "% 的试次。</p >" +
            "<p class='context'>您的平均反应时为" + rt + "毫秒。</p >";
    }
}

// 知觉匹配任务：再次练习指导语
var instr_repractice = { //在这里呈现文字recap，让被试再记一下
    type: jsPsychInstructions,
    pages: function () {
        let start = "<p class='header' style='font-size:35px; line-height:30px;'>请您努力记下如下匹配对应关系，并再次进行练习。</p>",
            middle = "<p class='footer' style='font-size:35px; line-height:30px;'>如果对本实验还有不清楚之处，请立即向实验员咨询。</p>",
            end = "<p style='font-size:35px; line-height:30px;'>如果您明白了规则：</p><p style='font-size:35px; line-height:30px;'>请按 继续 进入练习</p><div>";
        let tmpI = "";
        view_texts_images.forEach(v => {
            tmpI += `<p class="content" style='font-size:35px'>${v}</p>`;
        });
        return ["<p class='header' style='font-size:35px; line-height:30px;'>您的正确率未达到进入正式实验的要求。</p>",
            start + `<div class="box">${tmpI}</div>`,
            `<p class='footer' style='font-size:35px; line-height:30px;'>您的任务是判断几何图形与文字标签是否匹配，</p>
      <p class='footer' style='font-size:35px; line-height:30px;'>如果二者<span style="color: lightgreen;">匹配</span>，请按键盘 <span style="color: lightgreen;">${key_match_chinese[0]}</span></p>
      <p class='footer' style='font-size:35px; line-height:30px;'>如果二者<span style="color: lightgreen;">不匹配</span>，请按键盘<span style="color: lightgreen;"> ${key_match_chinese[1]}</p>
      </span><p class='footer' style='color: lightgreen; font-size:35px; line-height:30px;'>请您又快又准地进行按键。</p></span>`,
            middle + end];
    },
    show_clickable_nav: true,
    button_label_previous: " <span class='add_' style='color:black; font-size: 20px;'> 返回</span>",
    button_label_next: " <span class='add_' style='color:black; font-size: 20px;'> 继续</span>",
    on_finish: function () {
        $("body").css("cursor", "none");
    },
    on_load: () => {
        $("body").css("cursor", "default");
    }
}
// 知觉匹配任务：再次练习判断与执行
var if_node = { //if_node 用于判断是否呈现feedback_matching_task_p，instruction_repractice
    timeline: [feedback_block_prac, instr_repractice],
    conditional_function: function (data) {
        var trials = jsPsych.data.get().filter(
            [{ correct: true }, { correct: false }]
        ).last(24);//这里注意：只需要上一组的练习数据，而不是所有的数据！！ 如何实现：.last() 取data最后的几组数据（上一组练习数据）
        var correct_trials = trials.filter({
            correct: true
        });
        var accuracy = Math.round(correct_trials.count() / trials.count() * 100);
        if (accuracy >= acc) {
            return false;//达标skip掉if_node3
        } else if (accuracy < acc) { //没达标则执行if_node3
            return true;
        }
    }
}

// 知觉匹配任务：循环练习阶段
var loop_node = {
    timeline: [matching_prac, if_node],
    loop_function: function () {
        var trials = jsPsych.data.get().filter(
            [{ correct: true }, { correct: false }]
        ).last(24);//填练习阶段所有trial数
        var correct_trials = trials.filter({
            correct: true
        });
        var accuracy = Math.round(correct_trials.count() / trials.count() * 100);
        if (accuracy >= acc) {
            return false;// 正确率达标，跳过练习循环
        } else if (accuracy < acc) { // 不达标，repeat
            return true;
        }
    }
}
timeline.push(loop_node);

// 知觉匹配任务：进入正式实验指导语
var feedback_goformal_matching = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: function () {
        let trials = jsPsych.data.get().filter(
            [{ correct: true }, { correct: false }]
        ).last(24);
        let correct_trials = trials.filter({
            correct: true
        });
        let accuracy = Math.round(correct_trials.count() / trials.count() * 100);
        let rt = Math.round(correct_trials.select('rt').mean());
        return "<style>.context{color:white; font-size: 35px; line-height:40px}</style>\
                          <div><p class='context'>您正确回答了" + accuracy + "% 的试次。</p >" +
            "<p class='context'>您的平均反应时为" + rt + "毫秒。</p >" +
            "<p class='context'>恭喜您完成练习。按任意键进入知觉匹配任务正式实验。</p >" +
            "<p style = 'color:lightgreen; font-size: 35px;' >正式实验与练习要求相同，请您尽可能又快又准地进行按键反应</p>" +
            "<p class='footer' style='font-size: 22px; line-height:40px;'>请将您右手的<span style='color: lightgreen;'>食指与无名指</span>放在电脑键盘的相应键位上进行按键。</p >"
    },
    on_finish: function () {
        $("body").css("cursor", "none");
    }
}
timeline.push(feedback_goformal_matching);

// 知觉匹配任务：正式实验
let matching_task = {
    timeline: [
        {
            type: jsPsychPsychophysics,
            stimuli: [
                {
                    obj_type: 'cross',
                    startX: "center", // location of the cross's center in the canvas
                    startY: "center",
                    line_length: 40, // pixels 视角：0.8° x 0.8°
                    line_width: 5,
                    line_color: 'white', // You can use the HTML color name instead of the HEX color.
                    show_start_time: 500,
                    show_end_time: 1100// ms after the start of the trial
                },
                {
                    obj_type: "image",
                    file: function () { return jsPsych.timelineVariable("Image")() },
                    startX: "center", // location of the cross's center in the canvas
                    startY: -200,//-250
                    width: 190,  // 调整图片大小 视角：3.8° x 3.8°
                    heigth: 190, // 调整图片大小 视角：3.8° x 3.8°
                    show_start_time: 1000, // ms after the start of the trial
                    show_end_time: 1100,//出现50ms
                    origin_center: true
                },//上一组end时间减去下一组show时间就是空屏的100ms
                {
                    obj_type: 'text',
                    file: function () { return jsPsych.timelineVariable("word") },
                    startX: "center",
                    startY: 100, //140，
                    content: function () {
                        return jsPsych.timelineVariable('word', true)();
                    },
                    font: `${80}px 'Arial'`, //字体和颜色设置 文字视角：3.6° x 1.6°
                    text_color: 'white',
                    show_start_time: 1000, // ms after the start of the trial
                    show_end_time: 1100,//出现50ms
                    origin_center: true
                }
            ],

            choices: ['arrowleft', 'arrowright'],
            response_start_time: 1000,//开始作答时间，第二个刺激开始计算
            trial_duration: 2500,//结束时间，一共作答时间持续1500ms
            data: function () { return jsPsych.timelineVariable("identify") },
            on_finish: function (data) {
                data.correct_response = jsPsych.timelineVariable("identify", true)();
                data.correct = data.correct_response == data.key_press;//0错1对
                data.Image = jsPsych.timelineVariable("Image", true)();
                data.word = jsPsych.timelineVariable('word', true)();
                data.condition = "matching_task";
                data.shape = jsPsych.timelineVariable("shape", true)();
                data.association = view_texts_images;
            }
        },
        {
            data: {
                screen_id: "feedback_test"//这里为反馈
            },
            type: jsPsychHtmlKeyboardResponse,
            stimulus: function () {
                let keypress = jsPsych.data.get().last(1).values()[0].key_press; // 被试按键
                //let trial_keypress = jsPsych.data.get().last(1).values()[0].correct; //该trial正确的按键
                let time = jsPsych.data.get().last(1).values()[0].rt;
                let trial_correct_response = jsPsych.data.get().last(1).values()[0].correct_response;//该trial正确的按键
                if (time > 1500 || time === null) { //大于1500或为null为过慢
                    return "<span class='add_' style='color:yellow; font-size: 70px;'> 太慢! </span>"
                } else if (time < 200) { //小于两百为过快反应
                    return "<span style='color:yellow; font-size: 70px;'>过快! </span>"
                } else {
                    if (keypress == trial_correct_response) { //如果按键 == 正确按键
                        return "<span style='color:GreenYellow; font-size: 70px;'>正确! </span>"
                    }
                    else {
                        return "<span style='color:red; font-size: 70px;'>错误! </span>"
                    }
                }
            },

            choices: "NO_KEYS",
            trial_duration: 500,//500ms反馈
        }
    ],

    timeline_variables: [
        { Image: function () { return images[0] }, shape: function () { return texts[0] }, word: function () { return texts[0] }, identify: function () { return key_match[0] } },
        { Image: function () { return images[0] }, shape: function () { return texts[0] }, word: function () { return texts[0] }, identify: function () { return key_match[0] } },
        { Image: function () { return images[0] }, shape: function () { return texts[0] }, word: function () { return texts[1] }, identify: function () { return key_match[1] } },
        { Image: function () { return images[0] }, shape: function () { return texts[0] }, word: function () { return texts[2] }, identify: function () { return key_match[1] } },

        { Image: function () { return images[1] }, shape: function () { return texts[1] }, word: function () { return texts[0] }, identify: function () { return key_match[1] } },
        { Image: function () { return images[1] }, shape: function () { return texts[1] }, word: function () { return texts[1] }, identify: function () { return key_match[0] } },
        { Image: function () { return images[1] }, shape: function () { return texts[1] }, word: function () { return texts[1] }, identify: function () { return key_match[0] } },
        { Image: function () { return images[1] }, shape: function () { return texts[1] }, word: function () { return texts[2] }, identify: function () { return key_match[1] } },

        { Image: function () { return images[2] }, shape: function () { return texts[2] }, word: function () { return texts[0] }, identify: function () { return key_match[1] } },
        { Image: function () { return images[2] }, shape: function () { return texts[2] }, word: function () { return texts[1] }, identify: function () { return key_match[1] } },
        { Image: function () { return images[2] }, shape: function () { return texts[2] }, word: function () { return texts[2] }, identify: function () { return key_match[0] } },
        { Image: function () { return images[2] }, shape: function () { return texts[2] }, word: function () { return texts[2] }, identify: function () { return key_match[0] } },
    ],
    randomize_order: true,
    repetitions: 6, //6;一个block里的试次数
    on_load: () => {
        $("body").css("cursor", "none");
    },
    on_finish: function () {
        $("body").css("cursor", "default"); 
    }
}

// block结束后反馈
let feedback_block_matching = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: function () {
        // aaaaa = 1;  筛选，必须要！！！！！！！！！！！
        let trials = jsPsych.data.get().filter(
            [{ correct: true }, { correct: false }]
        ).last(72);// 72;last()填入一个block里的trial总数;
        let correct_trials = trials.filter({
            correct: true
        });
        let accuracy = Math.round(correct_trials.count() / trials.count() * 100);
        let rt = Math.round(correct_trials.select('rt').mean());
        return "<style>.context{color:white; font-size: 35px; line-height:40px}</style>\
                          <div><p class='context'>您正确回答了" + accuracy + "% 的试次。</p>" +
            "<p class='context'>您的平均反应时为" + rt + "毫秒。</p>" +
            "<p class='context'>请按任意键进入休息</p></div>";
    },
    on_finish: function () {
        $("body").css("cursor", "default"); //鼠标出现
    }
};

// 休息指导语
let blockTotalNum_same = 4;// 此处填入总block数量-1，比如总数量是3，那么值就需要是2
let rest_matching_task = {
    type: jsPsychHtmlButtonResponse,
    stimulus: function () {
        let totaltrials = jsPsych.data.get().filter(
            [{ correct: true }, { correct: false }]
        );
        return `
                    <p>知觉匹配任务中，您还剩余${blockTotalNum_same}组实验</p>
                    <p>现在是休息时间，当您结束休息后，您可以点击 结束休息 按钮 继续</p>
                    <p>建议休息时间还剩余<span id="iii">60</span>秒</p>`
    },
    choices: ["结束休息"],
    on_load: function () {
        $("body").css("cursor", "default");
        let tmpTime = setInterval(function () {
            $("#iii").text(parseInt($("#iii").text()) - 1);
            if (parseInt($("#iii").text()) < 1) {
                $("#iii").parent().text("当前限定休息时间已到达，如果还未到达状态，请继续休息");
                clearInterval(parseInt(sessionStorage.getItem("tmpInter")));
            }
        }, 1000);
        sessionStorage.setItem("tmpInter", tmpTime);
    },
    on_finish: function () {
        // $("body").css("cursor", "none"); //鼠标消失
        blockTotalNum_same -= 1;
        $(document.body).unbind();
        clearInterval(parseInt(sessionStorage.getItem("tmpInter")));
    }
}

// 设置重复进行block
var repeatblock_matching = [
    {
        timeline: [matching_task, feedback_block_matching, rest_matching_task],
        repetitions: 5//5
    },

];

timeline.push({
    timeline: [{
        timeline: repeatblock_matching,

    }]
});


// 分类任务：指导语
var Instr_classifying_task = {
    type: jsPsychInstructions,
    pages: function () {
        let start = "<p class='header' style = 'font-size: 35px'>请您记住如下对应关系:</p>",
            middle = "<p class='footer'  style = 'font-size: 35px'>如果对本实验还有不清楚之处，请立即向实验员咨询。</p>",
            end = "<p style = 'font-size: 35px; line-height: 35px;'>如果您明白了规则：请点击 继续 </p><div>";
        // 呈现图形--标签对应关系
        let tmpI = "";
        view_texts_images.forEach(v => {
            tmpI += `<p class="content">${v}</p>`;
        });
        return [
            "<p class='header' style = 'font-size: 35px'>恭喜您完成知觉匹配任务！</p>" +
            "<p style='color:lightgreen; font-size: 35px;'>接下来您将进入图形分类任务</p>" +
            "<p style='color:white; font-size: 35px;'>请您再次记住三种几何图形与文字标签的对应关系。</p> ",
            `<div class="box">${tmpI}</div>`,
            "<p style='color:white; font-size: 35px; line-height: 35px;'>在图形分类任务中，<p style='color:lightgreen; font-size: 35px;'>您的任务是将几何图形分成自我图形与非自我图形两类。</span></p>" +
            "<p style = 'color:white; font-size: 35px;' > 图形上方会显示分类标签，<p style='color:lightgreen; font-size: 35px;'>您需要根据标签的位置按下键盘的左键或右键对图形进行分类</span></p>" +
            "<p style = 'color:white; font-size: 35px; line-height: 35px;' > 分类标签的位置在实验过程中会产生左右变化，<p style='color:lightgreen; font-size: 35px;'>请您尽可能又快又准地按键。</span></p> ",
            middle + end];
    },
    show_clickable_nav: true,
    button_label_previous: " <span class='add_' style='color:black; font-size: 20px;'> 返回</span>",
    button_label_next: " <span class='add_' style='color:black; font-size: 20px;'> 继续</span>",
}
timeline.push(Instr_classifying_task);

/* 自我条件练习 */
var instr_self = {
    type: jsPsychInstructions,
    pages: function () {
        return [
            "<p class='header' style = 'font-size: 35px'>首先进入图形分类任务的练习阶段</p>" +
            "<p style='color:lightgreen; font-size: 35px; line-height: 35px'>请您又快又准地进行按键</p>" +
            "<p style='color:white; font-size: 35px; line-height: 35px'>通过练习后，您将进入图形分类任务的正式实验</p>" +
            "<p style='color:white; font-size: 35px; line-height: 35px'>正式实验共包括5组分类任务，每组完成后有休息时间</p>"
        ];
    },
    show_clickable_nav: true,
    button_label_previous: " <span class='add_' style='color:black; font-size: 20px;'> 返回</span>",
    button_label_next: " <span class='add_' style='color:black; font-size: 20px;'> 继续</span>",
    on_load: () => {
        $("body").css("cursor", "default");
    },
    on_finish: function () {
        $("body").css("cursor", "none");
    } 
}
timeline.push(instr_self);

//分类任务练习阶段（练习过程鼠标消失，练习结束鼠标出现）
let prac_self = {
    timeline: [
        // 刺激
        {
            type: jsPsychPsychophysics,
            stimuli: [
                {
                    obj_type: 'cross',
                    startX: "center", // location of the cross's center in the canvas
                    startY: "center",
                    line_length: 40,
                    line_width: 5,
                    line_color: 'white', // You can use the HTML color name instead of the HEX color.
                    show_start_time: 500,
                    show_end_time: 1100// ms after the start of the trial
                },
                {
                    obj_type: "image",
                    file: function () { return jsPsych.timelineVariable("Image")() },
                    startX: "center", // location of the cross's center in the canvas
                    startY: "center",//175
                    width: 190,  // 调整图片大小 视角：3.8° x 3.8°
                    heigth: 190, // 调整图片大小 视角：3.8° x 3.8°
                    show_start_time: 1000, // ms after the start of the trial
                    show_end_time: 1100,// 2000
                    origin_center: true
                },//上一组end时间减去下一组show时间就是空屏的100ms
                {
                    obj_type: 'text',
                    file: function () { return jsPsych.timelineVariable("LeftLable") },
                    startX: -400,//-200
                    startY: -250, //-175
                    content: function () {
                        return jsPsych.timelineVariable('LeftLable');
                    },
                    font: `${80}px 'Arial'`, //字体和颜色设置 文字视角：3.6° x 1.6°
                    text_color: 'white',
                    show_start_time: 1000, // ms after the start of the trial
                    show_end_time: 2500,//1100
                    origin_center: true
                },
                {
                    obj_type: 'text',
                    file: function () { return jsPsych.timelineVariable("RightLable") },
                    startX: 400,//200
                    startY: -250, //-175
                    content: function () {
                        return jsPsych.timelineVariable('RightLable');
                    },
                    font: `${80}px 'Arial'`, //字体和颜色设置 文字视角：3.6° x 1.6°
                    text_color: 'white',
                    show_start_time: 1000, // ms after the start of the trial
                    show_end_time: 2500,//1100
                    origin_center: true
                },

            ],
            choices: ['arrowleft', 'arrowright'],
            response_start_time: 1000,//开始作答时间
            trial_duration: 2500,
            data: function () { return jsPsych.timelineVariable("identify") },
            on_finish: function (data) {
                data.condition = "prac_classify_self";
                data.correct_response = jsPsych.timelineVariable("identify", true)();
                data.correct = data.correct_response == data.key_press;//0对1错
                data.Image = jsPsych.timelineVariable("Image", true)();
                data.LeftLable = jsPsych.timelineVariable("LeftLable", true);
                data.RightLable = jsPsych.timelineVariable("RightLable", true);
                data.shape = jsPsych.timelineVariable("shape", true)();
                data.association = view_texts_images;
            }
        },
        // 反馈
        {
            type: jsPsychHtmlKeyboardResponse,
            stimulus: function () {
                let keypress = jsPsych.data.get().last(1).values()[0].key_press; // 被试按键
                console.log(keypress)
                let time = jsPsych.data.get().last(1).values()[0].rt;
                let trial_correct_response = jsPsych.data.get().last(1).values()[0].correct_response;//该trial正确的按键
                console.log(trial_correct_response)
                if (time > 1500 || time === null) { //大于1500或为null为过慢
                    return "<span class='add_' style='color:yellow; font-size: 70px;'> 太慢! </span>"
                } else if (time < 200) { //小于两百为过快反应
                    return "<span style='color:yellow; font-size: 70px;'>过快! </span>"
                } else {
                    if (keypress == trial_correct_response) { //如果按键 == 正确按键
                        return "<span style='color:GreenYellow; font-size: 70px;'>正确! </span>"
                    }
                    else {
                        return "<span style='color:red; font-size: 70px;'>错误! </span>"
                    }
                }
            },
            choices: "NO_KEYS",
            trial_duration: 300,//300ms反馈
            data: {
                screen_id: "feedback_test"
            },
        }
    ],
    timeline_variables: [
        {
            Image: function () { return images[0] }, LeftLable: Lable[0], RightLable: Lable[1],
            identify: function () {
                if (myMap.get(images[0]) === "自我") {
                    return key_classify[0];
                } else return key_classify[1];
            },
            shape: function () { return texts[0] },
            // identify:function(){return key_classify[0]}

        },
        {
            Image: function () { return images[0] }, LeftLable: Lable[1], RightLable: Lable[0],
            identify: function () {
                if (myMap.get(images[0]) === "自我") {
                    return key_classify[1];
                } else return key_classify[0];
            },
            shape: function () { return texts[0] },
            // identify:function(){return key[1]}
        },
        {
            Image: function () { return images[0] }, LeftLable: Lable[0], RightLable: Lable[1],
            identify: function () {
                if (myMap.get(images[0]) === "自我") {
                    return key_classify[0];
                } else return key_classify[1];
            },
            shape: function () { return texts[0] },
            // identify:function(){return key[0]}
        },
        {
            Image: function () { return images[0] }, LeftLable: Lable[1], RightLable: Lable[0],
            identify: function () {
                if (myMap.get(images[0]) === "自我") {
                    return key_classify[1];
                } else return key_classify[0];
            },
            shape: function () { return texts[0] },
            // identify:function(){return key_classify[1]}
        },
        {
            Image: function () { return images[1] }, LeftLable: Lable[0], RightLable: Lable[1],
            identify: function () {
                if (myMap.get(images[1]) === "自我") {
                    return key_classify[0];
                } else return key_classify[1];
            },
            shape: function () { return texts[1] },
            // identify:function(){return key_classify[1]}
        },
        {
            Image: function () { return images[1] }, LeftLable: Lable[1], RightLable: Lable[0],
            identify: function () {
                if (myMap.get(images[1]) === "自我") {
                    return key_classify[1];
                } else return key_classify[0];
            },
            shape: function () { return texts[1] },
            // identify:function(){return key_classify[0]}
        },
        {
            Image: function () { return images[2] }, LeftLable: Lable[0], RightLable: Lable[1],
            identify: function () {
                if (myMap.get(images[2]) === "自我") {
                    return key_classify[0];
                } else return key_classify[1];
            },
            shape: function () { return texts[2] },
            // identify:function(){return key_classify[1]}
        },
        {
            Image: function () { return images[2] }, LeftLable: Lable[1], RightLable: Lable[0],
            identify: function () {
                if (myMap.get(images[2]) === "自我") {
                    return key_classify[1];
                } else return key_classify[0];
            },
            shape: function () { return texts[2] },
            // identify:function(){return key_classify[0]}
        }
    ],
    randomize_order: true,
    repetitions: 4,//；4；32个prac_trial
    on_load: () => {
        $("body").css("cursor", "none");
    },
    on_finish: function () {
        $("body").css("cursor", "default"); //鼠标出现
    }
}

var feedback_p = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: function () {
        let trials = jsPsych.data.get().filter(
            [{ correct: true }, { correct: false }]
        ).last(32); //这里填入timeline_variables里面的trial数量  
        let correct_trials = trials.filter({
            correct: true
        });
        let accuracy = Math.round(correct_trials.count() / trials.count() * 100);
        let rt = Math.round(correct_trials.select('rt').mean());
        return "<style>.context{color:white; font-size: 35px; line-height:40px}</style>\
                              <div><p class='context'>您正确回答了" + accuracy + "% 的试次。</p>" +
            "<p class='context'>您的平均反应时为" + rt + "毫秒。</p>";
    }
}

var instr_repractice_self = { //在这里呈现文字recap，让被试再记一下
    type: jsPsychInstructions,
    pages: function () {
        let start = "<p class='header' style='font-size:35px; line-height:35px;'>请您努力记下如下匹配对应关系，再次进行练习。</p>",
            middle = "<p class='footer' style='font-size:35px; line-height:35px;'>如果对本实验还有不清楚之处，请立即向实验员咨询。</p>",
            end = "<p style='font-size:35px; line-height:35px;'>如果您明白了规则：</p><p style='font-size:22px; line-height:25px;'>请按 继续 进入练习</p><div>";
        let tmpI = "";
        view_texts_images.forEach(v => {
            tmpI += `<p class="content" style='font-size:25px'>${v}</p>`;
        });
        return ["<p class='header' style='font-size:35px; line-height:35px;'>您的正确率未达到进入正式实验的要求。</p>",
            start + `<div class="box">${tmpI}</div>`,
            "<p style='color:white; font-size: 35px; line-height: 35px;'>在图形分类任务中，<p style='color:lightgreen; font-size: 35px;'>您的任务是将几何图形分成自我图形与非自我图形两类。</span></p>" +
            "<p style = 'color:white; font-size: 35px;' > 图形上方会显示分类标签，<p style='color:lightgreen; font-size: 35px;'>您需要根据标签的位置按下键盘的左键或右键对图形进行分类</span></p>" +
            "<p style = 'color:white; font-size: 35px; line-height: 35px;' > 分类标签的位置在实验过程中会产生左右变化，<p style='color:lightgreen; font-size: 35px;'>请您尽可能又快又准地按键。</span></p> ",
            middle + end];
    },
    show_clickable_nav: true,
    button_label_previous: " <span class='add_' style='color:black; font-size: 20px;'> 返回</span>",
    button_label_next: " <span class='add_' style='color:black; font-size: 20px;'> 继续</span>",
    on_finish: function () {
        $("body").css("cursor", "none");
    },
    on_load: () => {
        $("body").css("cursor", "default");
    }
}

var if_node_self = { //if_node 用于判断是否呈现feedback，feedback_continue_practice
    timeline: [feedback_p, instr_repractice_self],
    conditional_function: function (data) {
        var trials = jsPsych.data.get().filter(
            [{ correct: true }, { correct: false }]
        ).last(32);//上个练习阶段所有trial
        var correct_trials = trials.filter({
            correct: true
        });
        var accuracy = Math.round(correct_trials.count() / trials.count() * 100);
        if (accuracy >= acc) {
            return false;//达标就skip掉feedback_continue_practice这一段
        } else if (accuracy < acc) { //没达标反馈feedback,feedback_continue_practice
            return true;
        }
    }
}

var freeloop_node_self = {
    timeline: [prac_self, if_node_self],
    loop_function: function () {
        var trials = jsPsych.data.get().filter(
            [{ correct: true }, { correct: false }]
        ).last(32);//32;上个练习阶段所有trial
        var correct_trials = trials.filter({
            correct: true
        });
        var accuracy = Math.round(correct_trials.count() / trials.count() * 100);
        if (accuracy >= acc) {
            return false;//end 进入正式实验前的反馈
        } else if (accuracy < acc) { // repeat
            return true;
        }
    }
}
timeline.push(freeloop_node_self);


// 分类任务：进入正式实验指导语
var feedback_goformal_classify = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: function () {
        let trials = jsPsych.data.get().filter(
            [{ correct: true }, { correct: false }]
        ).last(32);
        let correct_trials = trials.filter({
            correct: true
        });
        let accuracy = Math.round(correct_trials.count() / trials.count() * 100);
        let rt = Math.round(correct_trials.select('rt').mean());
        return "<style>.context{color:white; font-size: 35px; line-height:40px}</style>\
                          <div><p class='context'>您正确回答了" + accuracy + "% 的试次。</p>" +
            "<p class='context'>您的平均反应时为" + rt + "毫秒。</p>" +
            "<p class='context'>恭喜您完成练习。按任意键进入分类任务正式实验。</p>" +
            "<p style = 'color:lightgreen; font-size: 35px;' >正式实验与练习要求相同，请您尽可能又快又准地进行按键反应</p>" +
            "<p class='footer' style='font-size: 22px; line-height:40px;'>请将您右手的<span style='color: lightgreen;'>食指与无名指</span>放在电脑键盘的相应键位上进行按键。</p>"
    },
    on_finish: function () {
        $("body").css("cursor", "none");
    }
}
timeline.push(feedback_goformal_classify);



/* 分类任务：正式实验（实验过程中鼠标消失，实验结束鼠标出现）*/
let self = {
    timeline: [
        // 刺激
        {
            type: jsPsychPsychophysics,
            stimuli: [
                {
                    obj_type: 'cross',
                    startX: "center", // location of the cross's center in the canvas
                    startY: "center",
                    line_length: 40,
                    line_width: 5,
                    line_color: 'white', // You can use the HTML color name instead of the HEX color.
                    show_start_time: 500,
                    show_end_time: 1100// ms after the start of the trial
                },
                {
                    obj_type: "image",
                    file: function () { return jsPsych.timelineVariable("Image")() },
                    startX: "center", // location of the cross's center in the canvas
                    startY: "center",//175
                    width: 190,  // 调整图片大小 视角：3.8° x 3.8°
                    heigth: 190, // 调整图片大小 视角：3.8° x 3.8°
                    show_start_time: 1000, // ms after the start of the trial
                    show_end_time: 1100,// 
                    origin_center: true
                },//上一组end时间减去下一组show时间就是空屏的100ms
                {
                    obj_type: 'text',
                    file: function () { return jsPsych.timelineVariable("LeftLable") },
                    startX: -400,//-200
                    startY: -250, //-175
                    content: function () {
                        return jsPsych.timelineVariable('LeftLable');
                    },
                    font: `${80}px 'Arial'`, //字体和颜色设置 文字视角：3.6° x 1.6°
                    text_color: 'white',
                    show_start_time: 1000, // ms after the start of the trial
                    show_end_time: 2500,//1100
                    origin_center: true
                },
                {
                    obj_type: 'text',
                    file: function () { return jsPsych.timelineVariable("RightLable") },
                    startX: 400,//200
                    startY: -250, //-175
                    content: function () {
                        return jsPsych.timelineVariable('RightLable');
                    },
                    font: `${80}px 'Arial'`, //字体和颜色设置 文字视角：3.6° x 1.6°
                    text_color: 'white',
                    show_start_time: 1000, // ms after the start of the trial
                    show_end_time: 2500,//1100
                    origin_center: true
                },

            ],
            choices: ['arrowleft', 'arrowright'],
            response_start_time: 1000,//开始作答时间
            trial_duration: 2500,
            data: function () { return jsPsych.timelineVariable("identify") },
            on_finish: function (data) {
                data.condition = "classify_self";
                data.correct_response = jsPsych.timelineVariable("identify", true)();
                data.correct = data.correct_response == data.key_press;//0对1错
                data.Image = jsPsych.timelineVariable("Image", true)();
                data.LeftLable = jsPsych.timelineVariable("LeftLable", true);
                data.RightLable = jsPsych.timelineVariable("RightLable", true);
                data.shape = jsPsych.timelineVariable("shape", true)();
                data.association = view_texts_images;

            }
        },
        // 反馈
        {
            type: jsPsychHtmlKeyboardResponse,
            stimulus: function () {
                let keypress = jsPsych.data.get().last(1).values()[0].key_press; // 被试按键
                console.log(keypress)
                //let trial_keypress = jsPsych.data.get().last(1).values()[0].correct; //该trial正确的按键
                let time = jsPsych.data.get().last(1).values()[0].rt;
                let trial_correct_response = jsPsych.data.get().last(1).values()[0].correct_response;//该trial正确的按键
                if (time > 1500 || time === null) { //大于1500或为null为过慢
                    return "<span class='add_' style='color:yellow; font-size: 70px;'> 太慢! </span>"
                } else if (time < 200) { //小于两百为过快反应
                    return "<span style='color:yellow; font-size: 70px;'>过快! </span>"
                } else {
                    if (keypress == trial_correct_response) { //如果按键 == 正确按键
                        return "<span style='color:GreenYellow; font-size: 70px;'>正确! </span>"
                    }
                    else {
                        return "<span style='color:red; font-size: 70px;'>错误! </span>"
                    }
                }
            },
            choices: "NO_KEYS",
            trial_duration: 300,//300ms反馈
            data: {
                screen_id: "feedback_test"
            },
        }
    ],
    timeline_variables: [
        {
            Image: function () { return images[0] }, LeftLable: Lable[0], RightLable: Lable[1], identify: function () {
                if (myMap.get(images[0]) === "自我") {
                    return key_classify[0];
                } else return key_classify[1];
            }, shape: function () { return texts[0] }
        },
        {
            Image: function () { return images[0] }, LeftLable: Lable[1], RightLable: Lable[0], identify: function () {
                if (myMap.get(images[0]) === "自我") {
                    return key_classify[1];
                } else return key_classify[0];
            }, shape: function () { return texts[0] }
        },
        {
            Image: function () { return images[0] }, LeftLable: Lable[0], RightLable: Lable[1], identify: function () {
                if (myMap.get(images[0]) === "自我") {
                    return key_classify[0];
                } else return key_classify[1];
            }, shape: function () { return texts[0] }
        },
        {
            Image: function () { return images[0] }, LeftLable: Lable[1], RightLable: Lable[0], identify: function () {
                if (myMap.get(images[0]) === "自我") {
                    return key_classify[1];
                } else return key_classify[0];
            }, shape: function () { return texts[0] }
        },
        {
            Image: function () { return images[1] }, LeftLable: Lable[0], RightLable: Lable[1], identify: function () {
                if (myMap.get(images[1]) === "自我") {
                    return key_classify[0];
                } else return key_classify[1];
            }, shape: function () { return texts[1] }
        },
        {
            Image: function () { return images[1] }, LeftLable: Lable[1], RightLable: Lable[0], identify: function () {
                if (myMap.get(images[1]) === "自我") {
                    return key_classify[1];
                } else return key_classify[0];
            }, shape: function () { return texts[1] }
        },
        {
            Image: function () { return images[2] }, LeftLable: Lable[0], RightLable: Lable[1], identify: function () {
                if (myMap.get(images[2]) === "自我") {
                    return key_classify[0];
                } else return key_classify[1];
            }, shape: function () { return texts[2] }
        },
        {
            Image: function () { return images[2] }, LeftLable: Lable[1], RightLable: Lable[0], identify: function () {
                if (myMap.get(images[2]) === "自我") {
                    return key_classify[1];
                } else return key_classify[0];
            }, shape: function () { return texts[2] }
        }
    ],
    randomize_order: true,
    repetitions: 8,//8
    on_load: () => {
        $("body").css("cursor", "none");
    },
    on_finish: function () {
        $("body").css("cursor", "default"); //鼠标出现
    }
}


/* 正式实验 反馈 */
let feedback_block = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: function () {
        // aaaaa = 1;  筛选，必须要！！！！！！！！！！！
        let trials = jsPsych.data.get().filter(
            [{ correct: true }, { correct: false }]
        ).last(64);// 64；last()填入一个block里的trial总数
        let correct_trials = trials.filter({
            correct: true
        });
        let accuracy = Math.round(correct_trials.count() / trials.count() * 100);
        let rt = Math.round(correct_trials.select('rt').mean());
        return "<style>.context{color:white; font-size: 35px; line-height:40px}</style>\
                          <div><p class='context'>您正确回答了" + accuracy + "% 的试次。</p>" +
            "<p class='context'>您的平均反应时为" + rt + "毫秒。</p>" +
            "<p class='context'>请按任意键进入休息</p></div>";
    },
    on_finish: function () {
         $("body").css("cursor", "default"); //鼠标出现
    }
};
let cong_self = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
  <p>恭喜您完成自我图形的分类任务。</p>
  <p> <div style = "color: green"><按任意键继续></div></p>
  `,
    choices: "ALL_KEYS",
};




/* 正式实验 休息 */
let blockTotalNum_Z = 4;// 此处填入总block数量-1，比如总数量是3，那么值就需要是2
let rest_self = {
    type: jsPsychHtmlButtonResponse,
    stimulus: function () {
        let totaltrials = jsPsych.data.get().filter(
            [{ correct: true }, { correct: false }]
        );
        return `
                  <p>自我图形分类任务中，您还剩余${blockTotalNum_Z}组实验</p>
                  <p>现在是休息时间，当您结束休息后，您可以点击 结束休息 按钮 继续</p>
                  <p>建议休息时间还剩余<span id="iii">60</span>秒</p>`
    },
    choices: ["结束休息"],
    on_load: function () {
        $("body").css("cursor", "default");
        let tmpTime = setInterval(function () {
            $("#iii").text(parseInt($("#iii").text()) - 1);
            if (parseInt($("#iii").text()) < 1) {
                $("#iii").parent().text("当前限定休息时间已到达，如果还未到达状态，请继续休息");
                clearInterval(parseInt(sessionStorage.getItem("tmpInter")));
            }
        }, 1000);
        sessionStorage.setItem("tmpInter", tmpTime);
    },
    on_finish: function () {
        //$("body").css("cursor", "none"); //鼠标消失
        blockTotalNum_Z -= 1;
        $(document.body).unbind();
        clearInterval(parseInt(sessionStorage.getItem("tmpInter")));
    }
}



/* 正式实验 时间线 */
var repeatblock1 = [
    {
        timeline: [self, feedback_block, rest_self],
        repetitions: 5 //5个block
    },
    cong_self
];


timeline.push({
    timeline: [{
        timeline: repeatblock1,
        conditional_function: () => {
            return jsPsych.timelineVariable("a", true) == 1
        }
    }],
    timeline_variables: jsPsych.randomization.factorial({
        a: jsPsych.randomization.shuffleNoRepeats(
            jsPsych.randomization.repeat([1], 1)
        )
    })
});

/* 实验结束语 */
var finish = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
        <p>感谢您参加我们的实验，请<span style="color: yellow;">按任意键开始下载数据</span>，并通知实验员。</p>
        <p>感谢您的配合！</p>`,
    choices: "ALL_KEYS",
};
timeline.push(finish);


jsPsych.run(timeline);

