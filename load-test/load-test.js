import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 200 },  // Tăng dần lên 200 user (Login rất nặng nên bắt đầu thấp hơn tí)
    { duration: '1m', target: 400 },  // Duy trì 400 user login liên tục
    { duration: '30s', target: 0 },    // Hạ nhiệt
  ],
};

export default function () {
  const url = 'https://www.cookial.site/customer/login'; // Thay bằng URL thực tế của endpoint login
  
  // Dữ liệu login - Nhã nên dùng một account có thật trong DB của nhóm
  const payload = JSON.stringify({
    email: 'anvu5437@gmail.com', 
    password: '666666',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Gửi request POST
  let res = http.post(url, payload, params);
  
  check(res, {
    'is status 200': (r) => r.status === 200,
    'has auth token': (r) => r.json().token !== undefined, // Kiểm tra xem có trả về token không
  });

  // Nghỉ 1 giây giữa mỗi lần login để giả lập người dùng thật 
  // (Nếu muốn đánh sập nhanh hơn thì giảm xuống 0.1)
  sleep(1); 
}