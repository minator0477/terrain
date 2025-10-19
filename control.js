export function setControl() {
    document.querySelectorAll('.header').forEach(header => {
        header.addEventListener('click', function() {
            const next = this.nextElementSibling; // 次の要素を取得
            console.log('clicked', next);
            if (next.style.display === 'none' || next.style.display === '') {
                next.style.display = 'block'; //表示
            } else {
                next.style.display = 'none'; //非表示
            }
        });
    });
}
