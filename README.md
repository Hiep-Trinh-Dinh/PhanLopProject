pnpm install //tải thư viện
pnpm dev //chạy localhost

tải docker về và chạy lệnh này trên cmd

docker pull redis:latest

docker run -d --name redis-container -p 6379:6379 redis
Rồi kiểm tra xem nó chạy được không