const mysql = require('mysql');
const express = require("express");
const bcrypt = require('bcryptjs');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const app = express();
const cors = require('cors');
const secretKey = 'your_secret_key';
// Sử dụng cors và express.json middleware
app.use([cors(), express.json()]);
// app.use(bodyParser.json());

// Tạo kết nối đến database
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    port: 3306,
    database: 'ban_hang'
});

// Kết nối đến database
db.connect(err => {
    if (err) throw err;
    console.log('Đã kết nối database');
});

// Định nghĩa endpoint /spmoi/:sosp?
app.get('/spmoi/:sosp?', function(req, res) {
    let sosp = parseInt(req.params.sosp) || 6;
    if (sosp <= 1) sosp = 6;

    let sql = `SELECT id, ten_sp, gia, gia_km, hinh, ngay, luot_xem 
               FROM san_pham WHERE an_hien = 1 ORDER BY ngay DESC LIMIT 0, ?`;

    db.query(sql, [sosp], (err, data) => {
        if (err) res.json({ "thongbao": "Lỗi lấy list sp", err });
        else res.json(data);
    });
});
app.get('/SPNoibat/:sosp?', function(req, res) {
    let sosp = parseInt(req.params.sosp) || 6;
    if (sosp <= 1) sosp = 6;

    let sql = `SELECT id, ten_sp, gia, gia_km, hinh, ngay, luot_xem 
               FROM san_pham WHERE an_hien = 1 ORDER BY gia DESC LIMIT 0, ?`;

    db.query(sql, [sosp], (err, data) => {
        if (err) res.json({ "thongbao": "Lỗi lấy list sp", err });
        else res.json(data);
    });
});
// Định nghĩa endpoint /sp/:id
app.get('/sp/:id', function(req, res) {
    let id = parseInt(req.params.id || 0);
    if (isNaN(id) || id <= 0) { 
        res.json({"thong bao": "Không biết sản phẩm", "id": id});
        return; 
    } 

    let sql = `SELECT id, ten_sp, gia, gia_km, hinh, ngay, luot_xem FROM san_pham WHERE id = ?`;

    db.query(sql, [id], (err, data) => {
        if (err) res.json({"thongbao": "Lỗi lấy 1 sp", err });
        else res.json(data[0]);
    });
});

// Định nghĩa endpoint /sptrongloai/:id_loai
app.get('/sptrongloai/:id_loai', function(req, res) {
    let id_loai = parseInt(req.params.id_loai);
    if (isNaN(id_loai) || id_loai <= 0) {
        res.json({ "thong bao": "Không biết loại", "id_loai": id_loai });
        return;
    }

    let sql = `SELECT id, ten_sp, gia, gia_km, hinh, ngay 
               FROM san_pham WHERE id_loai = ? AND an_hien = 1 ORDER BY id DESC`;

    db.query(sql, [id_loai], (err, data) => {
        if (err) res.json({ "thongbao": "Lỗi lấy sp trong loại", err });
        else res.json(data);
    });
});

// Định nghĩa endpoint /loai/:id_loai
app.get('/loai/:id_loai', function(req, res) {
    let id_loai = parseInt(req.params.id_loai);
    if (isNaN(id_loai) || id_loai <= 0) {
        res.json({ "thong bao": "Không biết loại", "id_loai": id_loai });
        return;
    }

    let sql = `SELECT id, ten_loai FROM loai WHERE id = ?`;

    db.query(sql, [id_loai], (err, data) => {
        if (err) {
            res.json({ "thongbao": "Lỗi lấy loại", err });
        } else {
            res.json(data[0]);
        }
    });
});
app.get('/timkiem', function(req, res) {
    const query = req.query.q; 
    if (!query) {
        res.json({ "thong bao": "Vui lòng nhập từ khóa tìm kiếm" });
        return;
    }

   
    let sql = `SELECT id, ten_sp, gia, gia_km, hinh, ngay 
               FROM san_pham 
               WHERE an_hien = 1 AND ten_sp LIKE ?`;

  
    let searchTerm = `%${query}%`;

    db.query(sql, [searchTerm], (err, data) => {
        if (err) {
            res.json({ "thongbao": "Lỗi tìm kiếm sản phẩm", err });
        } else {
            res.json(data);
        }
    });
});
app.get('/spxemnhieu/:sosp?', function(req, res) {
    let sosp = parseInt(req.params.sosp) || 6;
    if (sosp <= 1) sosp = 6;

    let sql = `SELECT id, ten_sp, gia, gia_km, hinh, ngay, luot_xem 
               FROM san_pham WHERE an_hien = 1 ORDER BY luot_xem DESC LIMIT 0, ?`;

    db.query(sql, [sosp], (err, data) => {
        if (err) res.json({ "thongbao": "Lỗi lấy list sp", err });
        else res.json(data);
    });
});
app.get('/sanpham_lienquan/:id', (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) {
        res.json({ "thongbao": "Không biết sản phẩm", "id": id });
        return;
    }

    
    let sqlLoai = `SELECT id_loai FROM san_pham WHERE id = ?`;
    db.query(sqlLoai, [id], (errLoai, resultLoai) => {
        if (errLoai) {
            res.json({ "thongbao": "Lỗi lấy loại sản phẩm", errLoai });
        } else {
            const id_loai = resultLoai[0].id_loai;

          
            let sql = `SELECT id, ten_sp, gia, gia_km, hinh 
                       FROM san_pham 
                       WHERE an_hien = 1 AND id_loai = ? AND id <> ? 
                       ORDER BY RAND() 
                       LIMIT 4`;

            db.query(sql, [id_loai, id], (err, data) => {
                if (err) {
                    res.json({ "thongbao": "Lỗi lấy sản phẩm liên quan theo loại", err });
                } else {
                    res.json(data);
                }
            });
        }
    });
});
app.post('/luudonhang/', function(req, res) {
    let data = req.body;
    let sql = `INSERT INTO don_hang SET ?`;
    db.query(sql, data, function(err, data) {
        if (err) {
            res.json({ "id_dh": -1, "thongbao": "Lỗi lưu đơn hàng", err });
        } else {
            let id_dh = data.insertId;
            res.json({ "id_dh": id_dh, "thongbao": "Đã lưu đơn hàng" });
        }
    });
});

app.post('/luugiohang/', function(req, res) {
    let data = req.body;
    let sql = `INSERT INTO don_hang_chi_tiet SET ?`;
    db.query(sql, data, function(err, d) {
        if (err) {
            res.json({ "thongbao": "Lỗi lưu sp", err });
        } else {
            res.json({ "thongbao": "Đã lưu sp vào db", "id_sp": data.id_sp });
        }
    });
});
app.get('/donhang/', (req, res) => {
  let sql = 'SELECT * FROM don_hang'; 
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching orders:", err);
      res.status(500).json({ "thongbao": "Lỗi lấy danh sách hóa đơn", "error": err });
    } else {
      res.json(results); 
    }
  });
});
app.delete('/donhang/:id', (req, res) => {
  const id = req.params.id;
  const sql = 'DELETE FROM don_hang WHERE id_dh = ?';
  db.query(sql, id, (err, result) => {
    if (err) {
      console.error("Lỗi khi xóa đơn hàng:", err);
      res.status(500).json({ "thongbao": "Lỗi khi xóa đơn hàng", "error": err });
    } else {
      console.log("Đã xóa đơn hàng thành công.");
      res.json({ "thongbao": `Đã xóa đơn hàng có id ${id}` });
    }
  });
});
// Ensure this route is set up in your Express server
app.get('/chitietdonhang/:id_dh', (req, res) => {
  const { id_dh } = req.params;
  
  // Query to get order details
  const sql = `SELECT * FROM don_hang_chi_tiet WHERE id_dh = ?`;
  
  db.query(sql, [id_dh], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      res.status(500).json({ thongbao: "Lỗi truy vấn cơ sở dữ liệu", error: err });
    } else {
      res.json({ thongbao: "Lấy chi tiết đơn hàng thành công", data: results });
    }
  });
});
app.get('/admin/sp', function (req, res) {
  let sql = `SELECT sp.id, sp.ten_sp, sp.gia, sp.hinh, sp.ngay, sp.luot_xem, l.ten_loai
             FROM san_pham sp
             JOIN loai l ON sp.id_loai = l.id
             ORDER BY sp.id DESC`;
  db.query(sql, (err, data) => {
    if (err) {
      res.json({ "thongbao": "Lỗi lấy list sp", err });
    } else {
      res.json(data);
    }
  });
});

app.get('/admin/sp/:id', function (req, res) {
  let id = parseInt(req.params.id);
  if (isNaN(id) || id <= 0) {
    res.json({ "thongbao": "Không biết sản phẩm", "id": id });
    return;
  }
  let sql = 'SELECT * FROM san_pham WHERE id = ?';
  db.query(sql, id, (err, data) => {
    if (err) {
      res.json({ "thongbao": "Lỗi lấy 1 sp", err });
    } else {
      if (data.length === 0) {
        res.json({ "thongbao": "Không tìm thấy sản phẩm", "id": id });
      } else {
        res.json(data[0]);
      }
    }
  });
});
app.get('/loai-san-pham', (req, res) => {
    let sql = 'SELECT * FROM loai';
    db.query(sql, (err, results) => {
        if (err) {
            res.status(500).json({ thongbao: 'Lỗi khi lấy loại sản phẩm', err });
        } else {
            res.json(results);
        }
    });
});
app.get('/loai-san-pham-count', (req, res) => {
  const query = `
    SELECT l.id as id_loai, l.ten_loai, COUNT(s.id) AS so_luong_san_pham
    FROM loai l
    LEFT JOIN san_pham s ON l.id = s.id_loai
    GROUP BY l.id, l.ten_loai
  `;
  
  db.query(query, (error, results) => {
    if (error) {
      console.error('Error fetching categories:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
    res.json(results);
  });
});
app.post('/admin/sp', (req, res) => {
    let { ten_sp, gia, gia_km, hinh, ngay, id_loai, luot_xem, an_hien } = req.body;
    let sqlCheckLoai = 'SELECT * FROM loai WHERE id = ?';
    db.query(sqlCheckLoai, [id_loai], (err, results) => {
        if (err) {
            res.status(500).json({ thongbao: 'Lỗi khi kiểm tra loại sản phẩm', err });
        } else if (results.length === 0) {
            res.status(400).json({ thongbao: 'Loại sản phẩm không tồn tại' });
        } else {
            let sqlInsert = 'INSERT INTO san_pham (ten_sp, gia, gia_km, hinh, ngay, id_loai, luot_xem, an_hien) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
            db.query(sqlInsert, [ten_sp, gia, gia_km, hinh, ngay, id_loai, luot_xem || 0, an_hien], (err, result) => {
                if (err) {
                    res.status(500).json({ thongbao: 'Lỗi khi thêm sản phẩm', err });
                } else {
                    res.status(201).json({ thongbao: 'Sản phẩm đã được thêm', id: result.insertId });
                }
            });
        }
    });
});




app.put('/admin/sp/:id', (req, res) => {
    const { id } = req.params;
    const { ten_sp, gia, gia_km, hinh, ngay, id_loai, luot_xem, an_hien } = req.body;

    let sqlCheck = 'SELECT * FROM san_pham WHERE id = ?';
    db.query(sqlCheck, [id], (err, results) => {
        if (err) {
            res.status(500).json({ thongbao: 'Lỗi khi kiểm tra sản phẩm', err });
        } else if (results.length === 0) {
            res.status(404).json({ thongbao: 'Sản phẩm không tồn tại' });
        } else {
            let sqlUpdate = 'UPDATE san_pham SET ten_sp = ?, gia = ?, gia_km = ?, hinh = ?, ngay = ?, id_loai = ?, luot_xem = ?, an_hien = ? WHERE id = ?';
            db.query(sqlUpdate, [ten_sp, gia, gia_km, hinh, ngay, id_loai, luot_xem, an_hien, id], (err, result) => {
                if (err) {
                    res.status(500).json({ thongbao: 'Lỗi khi cập nhật sản phẩm', err });
                } else {
                    res.status(200).json({ thongbao: 'Đã cập nhật sản phẩm' });
                }
            });
        }
    });
});


app.delete('/admin/sp/:id', function (req, res) {
  let id = req.params.id;
  let sql = 'DELETE FROM san_pham WHERE id = ?';
  
  db.query(sql, [id], (err, d) => {
    if (err) {
      res.json({ "thongbao": "Lỗi khi xóa sp", err });
    } else {
      res.json({ "thongbao": "Đã xóa sp" });
    }
  });
});

app.post('/register', (req, res) => {
    const { name, email, password, dien_thoai } = req.body;
    let sqlCheck = 'SELECT * FROM users WHERE email = ?';
    db.query(sqlCheck, [email], (err, result) => {
        if (err) return res.status(500).json({ thongbao: 'Lỗi khi kiểm tra email', err });

        if (result.length > 0) {
            return res.status(400).json({ thongbao: 'Email đã tồn tại' });
        }
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) {
                console.error("Lỗi khi mã hóa mật khẩu:", err); 
                return res.status(500).json({ thongbao: 'Lỗi khi mã hóa mật khẩu', err });
            }
            let sqlInsert = 'INSERT INTO users (name, email, password, dien_thoai) VALUES (?, ?, ?, ?)';
            db.query(sqlInsert, [name, email, hash, dien_thoai], (err, result) => {
                if (err) return res.status(500).json({ thongbao: 'Lỗi khi lưu thông tin người dùng', err });

                res.status(201).json({ thongbao: 'Đăng ký thành công' });4
            });
        });
    });
});
// Đăng nhập
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    let sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], (err, results) => {
        if (err) {
            console.error('Lỗi khi truy vấn email:', err);
            return res.status(500).json({ thongbao: 'Lỗi khi truy vấn email' });
        }
        if (results.length === 0) {
            return res.status(400).json({ thongbao: 'Email không tồn tại' });
        }
        const user = results[0];
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                console.error('Lỗi khi so sánh mật khẩu:', err);
                return res.status(500).json({ thongbao: 'Lỗi khi so sánh mật khẩu' });
            }
            if (!isMatch) {
                return res.status(400).json({ thongbao: 'Mật khẩu không đúng' });
            }
            const token = jwt.sign({ id: user.id }, secretKey, { expiresIn: '1h' });
            res.status(200).json({ thongbao: 'Đăng nhập thành công', token, user });
        });
    });
});


const authenticateJWT = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
        jwt.verify(token, 'your_secret_key', (err, user) => {
            if (err) {
                return res.status(403).json({ thongbao: 'Token không hợp lệ' });
            }
            req.user = user;
            next();
        });
    } else {
        res.status(401).json({ thongbao: 'Không có token, vui lòng đăng nhập' });
    }
};


app.get('/protected', authenticateJWT, (req, res) => {
    res.json({ thongbao: 'Đã truy cập thành công', user: req.user });
});


app.put('/change-password', authenticateJWT, (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Kiểm tra mật khẩu cũ và thay đổi mật khẩu mới
    let sqlCheckPassword = 'SELECT * FROM users WHERE id = ?';
    db.query(sqlCheckPassword, [userId], (err, results) => {
        if (err) {
            return res.status(500).json({ thongbao: 'Lỗi khi truy vấn người dùng' });
        }
        const user = results[0];
        if (!user) {
            return res.status(404).json({ thongbao: 'Người dùng không tồn tại' });
        }

        bcrypt.compare(oldPassword, user.password, (err, isMatch) => {
            if (err) {
                return res.status(500).json({ thongbao: 'Lỗi khi so sánh mật khẩu' });
            }
            if (!isMatch) {
                return res.status(400).json({ thongbao: 'Mật khẩu cũ không đúng' });
            }

            bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
                if (err) {
                    return res.status(500).json({ thongbao: 'Lỗi khi mã hóa mật khẩu' });
                }

                let sqlUpdatePassword = 'UPDATE users SET password = ? WHERE id = ?';
                db.query(sqlUpdatePassword, [hashedPassword, userId], (err) => {
                    if (err) {
                        return res.status(500).json({ thongbao: 'Lỗi khi cập nhật mật khẩu' });
                    }
                    res.status(200).json({ thongbao: 'Mật khẩu đã được đổi thành công' });
                });
            });
        });
    });
});
// Đăng xuất
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ thongbao: 'Đăng xuất không thành công' });
        }
        res.status(200).json({ thongbao: 'Đăng xuất thành công' });
    });
});
// Đếm số lượng người dùng
app.get('/count/users', (req, res) => {
  db.query('SELECT COUNT(*) AS total FROM users', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ total: results[0].total });
  });
});

// Đếm số lượng danh mục
app.get('/count/sp', (req, res) => {
  db.query('SELECT COUNT(*) AS total FROM loai', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ total: results[0].total });
  });
});

// Đếm số lượng đơn hàng
app.get('/count/orders', (req, res) => {
  db.query('SELECT COUNT(*) AS total FROM don_hang', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ total: results[0].total });
  });
});

// Đếm số lượng sản phẩm
app.get('/count/products', (req, res) => {
  db.query('SELECT COUNT(*) AS total FROM san_pham', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ total: results[0].total });
  });
});
app.post('/add/loai', (req, res) => {
    const { ten_loai, slug, thu_tu, an_hien } = req.body;
    
    if (!ten_loai) {
        return res.status(400).json({ message: 'Tên loại không được để trống' });
    }
    
    const query = `INSERT INTO loai (ten_loai, slug, thu_tu, an_hien, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())`;
    const values = [ten_loai, slug, thu_tu, an_hien];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Lỗi khi thêm loại sản phẩm:', err);
            return res.status(500).json({ message: 'Lỗi khi thêm loại sản phẩm' });
        }
        res.status(201).json({ message: 'Thêm loại sản phẩm thành công', id: result.insertId });
    });
});

app.delete('/loai/:id', (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) {
        return res.status(400).json({ thongbao: "ID loại sản phẩm không hợp lệ" });
    }

    
    const checkSql = 'SELECT COUNT(*) AS count FROM san_pham WHERE id_loai = ?';
    db.query(checkSql, [id], (err, result) => {
        if (err) {
            console.error('Lỗi khi kiểm tra loại sản phẩm:', err);
            return res.status(500).json({ thongbao: "Lỗi khi kiểm tra loại sản phẩm", error: err });
        }

        if (result[0].count > 1) {
            return res.status(400).json({ thongbao: "Không thể xóa loại sản phẩm vì vẫn còn sản phẩm thuộc loại này" });
        }

       
        const deleteSql = 'DELETE FROM loai WHERE id = ?';
        db.query(deleteSql, [id], (err, result) => {
            if (err) {
                console.error('Lỗi khi xóa loại sản phẩm:', err);
                return res.status(500).json({ thongbao: "Lỗi khi xóa loại sản phẩm", error: err });
            }
            res.json({ thongbao: `Đã xóa loại sản phẩm với ID ${id}` });
        });
    });
});
app.put('/loai/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { ten_loai } = req.body;

    if (isNaN(id) || id <= 0) {
        return res.status(400).json({ "thongbao": "ID loại sản phẩm không hợp lệ" });
    }

    const sql = 'UPDATE loai SET ten_loai = ? WHERE id = ?';
    db.query(sql, [ten_loai, id], (err, result) => {
        if (err) {
            console.error('Lỗi khi cập nhật loại sản phẩm:', err);
            return res.status(500).json({ "thongbao": "Lỗi khi cập nhật loại sản phẩm", "error": err });
        }
        res.json({ "thongbao": "Đã cập nhật loại sản phẩm thành công" });
    });
});

// Lắng nghe trên port 3000
app.listen(3000, () => console.log(`Ứng dụng đang chạy với port 3000`));
