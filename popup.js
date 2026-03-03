// popup.js
const shiftNames = ["白班", "小夜", "大夜"];
let viewDate = new Date();
let config = { baseDate: new Date("2026-02-25"), baseShiftIndex: 0 };

function init() {
    const saved = localStorage.getItem('shiftConfig');
    if (saved) {
        const parsed = JSON.parse(saved);
        config.baseDate = new Date(parsed.dateStr);
        config.baseShiftIndex = parseInt(parsed.baseShiftIndex);
        document.getElementById('baseDateInput').value = parsed.dateStr;
        document.getElementById('baseShiftInput').value = parsed.baseShiftIndex;
    } else {
        document.getElementById('baseDateInput').value = "2026-02-25";
        document.getElementById('baseShiftInput').value = "0";
    }
    render();
}

function updateSettings() {
    const dateStr = document.getElementById('baseDateInput').value;
    const shiftIdx = document.getElementById('baseShiftInput').value;
    if(!dateStr) return;
    
    // 1. 更新内存配置
    config.baseDate = new Date(dateStr);
    config.baseDate.setHours(0,0,0,0);
    config.baseShiftIndex = parseInt(shiftIdx);

    // 2. 关键步骤：将当前显示的月份切换到基准日期所在的月份
    viewDate = new Date(config.baseDate);

    // 3. 持久化到 LocalStorage
    localStorage.setItem('shiftConfig', JSON.stringify({ 
        dateStr: dateStr, 
        baseShiftIndex: shiftIdx 
    }));

    // 4. 重新渲染
    render();
}


function changeMonth(step) {
    viewDate.setMonth(viewDate.getMonth() + step);
    render();
}

function render() {
    const grid = document.getElementById('calendarGrid');
    if (!grid) return;
    grid.innerHTML = '';
    
    ['日','一','二','三','四','五','六'].forEach(w => {
        const div = document.createElement('div');
        div.className = 'weekday';
        div.innerText = w;
        grid.appendChild(div);
    });

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    document.getElementById('currentViewTitle').innerText = `${year}年${month + 1}月`;

    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay();
    const lastDay = new Date(year, month + 1, 0).getDate();

    for(let i=0; i<startOffset; i++) {
        const div = document.createElement('div');
        div.className = 'day other-month';
        grid.appendChild(div);
    }

    const todayStr = new Date().toDateString();
    for(let d=1; d<=lastDay; d++) {
        const curr = new Date(year, month, d);
        curr.setHours(0,0,0,0);
        const diffDays = Math.round((curr - config.baseDate) / 86400000);
        let shiftIndex = (diffDays + config.baseShiftIndex) % 3;
        if (shiftIndex < 0) shiftIndex += 3;
        
        const shift = shiftNames[shiftIndex];
        const isToday = curr.toDateString() === todayStr ? 'is-today' : '';
        
        const dayDiv = document.createElement('div');
        dayDiv.className = `day ${isToday}`;
        dayDiv.innerHTML = `
            <span class="day-num">${d}</span>
            <span class="shift-label shift-${shift}">${shift}</span>
        `;
        grid.appendChild(dayDiv);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    init(); // 初始化加载数据并渲染
    
    // 绑定保存按钮
    document.querySelector('.btn-save').addEventListener('click', updateSettings);
    
    // 绑定左右切换按钮（注意：HTML里的 onclick 必须删掉，改用这里的监听）
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns[0].addEventListener('click', () => changeMonth(-1)); // 左箭头
    navBtns[1].addEventListener('click', () => changeMonth(1));  // 右箭头
});

