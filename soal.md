# Soal 1 (20 poin)

```bash
# SOAL
Diagnosa & Perbaikan Route (Bug-intentional)
Potongan routes/web.php berikut mengandung kesalahan sehingga halaman 'create user' tidak bisa diakses dan terjadi konflik routing:

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;

Route::get('/users/{id}', [UserController::class, 'show'])->name('users.show');
Route::get('/users/create', [UserController::class, 'create'])->name('users.create');
Route::resource('/users', UserController::class);

# KUNCI
Masalah: urutan route salah. '/users/{id}' didefinisikan sebelum '/users/create', sehingga string 'create' dianggap {id}. Akibatnya, halaman create error (404).

Perbaikan:
Route::get('/users/create', [UserController::class, 'create'])->name('users.create');
Route::get('/users/{id}', [UserController::class, 'show'])->whereNumber('id')->name('users.show');
Route::resource('users', UserController::class)->except(['create','show']);

Alasan: route statis harus didefinisikan sebelum route dinamis agar tidak tertangkap parameter.
```

# Soal 2 (20 poin)

```bash
# SOAL
Jelaskan bagaimana alur request–response pada Laravel berbasis arsitektur MVC, mulai dari URL diakses hingga response dikirim ke browser. Kaitkan peran Route, Controller, Model (Eloquent), dan View (Blade).

# KUNCI
1. Route menerima URL dan menentukan controller yang dipanggil.
2. Controller menjalankan logic, memproses request, dan memanggil Model (Eloquent) untuk query data.
3. Data dari model dikirim ke View (Blade) untuk dirender menjadi HTML.
4. HTML hasil render dikirim sebagai response ke browser.

Diagram:
URL → Route → Controller → Model → View → Response
```

# Soal 3 (20 poin)

```bash
# SOAL
Buat migration untuk tabel `products` dengan kolom: id, name (string), price (unsignedInteger), stock (unsignedInteger default 0), created_at, dan updated_at. Jelaskan juga cara membuat seeder minimal 3 data contoh.

# KUNCI
Migration:
Schema::create('products', function (Blueprint $table) {
  $table->id();
  $table->string('name');
  $table->unsignedInteger('price');
  $table->unsignedInteger('stock')->default(0);
  $table->timestamps();
});

Seeder:
DB::table('products')->insert([
 ['name'=>'Masker', 'price'=>10000, 'stock'=>50],
 ['name'=>'Sarung Tangan', 'price'=>15000, 'stock'=>30],
 ['name'=>'Hand Sanitizer', 'price'=>20000, 'stock'=>40]
]);

Penjelasan:
- Migration untuk struktur tabel.
- Seeder untuk data awal otomatis.
```

# Soal 4 (20 poin)

```bash
# SOAL
1. Tulis potongan kode model untuk relasi satu Category memiliki banyak Product.
2. Tunjukkan contoh query untuk menampilkan semua produk milik kategori dengan id=5.

# KUNCI
Model Category:
public function products() {
  return $this->hasMany(Product::class);
}

Model Product:
public function category() {
  return $this->belongsTo(Category::class);
}

Query:
$products = Category::with('products')->find(5)->products;

Penjelasan:
- Relasi one-to-many: satu kategori bisa punya banyak produk.
- Query di atas mengambil semua produk milik kategori id=5.
```

# Soal 5 (20 poin)

```bash
# SOAL
1. Buat aturan validasi untuk field: name (wajib, min:3), price (wajib, integer ≥ 0), stock (opsional, integer ≥ 0).
2. Tunjukkan implementasi Form Request dan cara penggunaannya di Controller.

# KUNCI
Form Request rules:
public function rules() {
  return [
    'name' => 'required|string|min:3',
    'price' => 'required|integer|min:0',
    'stock' => 'nullable|integer|min:0'
  ];
}

Controller:
public function store(StoreProductRequest $request) {
  Product::create($request->validated());
}

Penjelasan:
- Form Request memudahkan validasi input secara terpusat.
- Controller cukup memanggil $request->validated() untuk data yang sudah lolos validasi.
```