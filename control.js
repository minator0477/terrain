import { addMeizan, makeMountainList } from './addLoadedEvent'
export function setControl(map) {
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

    document.querySelectorAll('.date-input').forEach(input => {
        input.addEventListener('change', async (e) => {
            const startDate = new Date(document.getElementById('start-date').value);
            const endDate = new Date(document.getElementById('end-date').value);

            if (endDate < startDate) {
                alert("終了日が開始日より前です！");
                throw new Error("終了日が開始日より前です！");
            } else {
                const geojson = await makeMountainList(new Date(startDate), new Date(endDate)); //名山のGeoJSONを取得
                addMeizan(map, geojson); //名山ソース、名山ソースを追加
            }
        });
    });
}
