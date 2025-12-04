# PEPADUN - Platform Ekonomi Pelaku Usaha Daerah untuk Bandar Lampung
**"Sai Bumi, Sai Data UMKM"**

PEPADUN adalah akronim dari “_Platform_ Ekonomi Pelaku Usaha Daerah untuk Bandar Lampung”, yang terinspirasi dari ‘pepadun’ merujuk pada kursi adat Lampung sebagai simbol martabat dan kepemimpinan. Nama ini mencerminkan fungsi aplikasi sebagai pusat informasi UMKM yang terstruktur, mudah diakses, dan disajikan secara terpeta sehingga membantu masyarakat menemukan usaha lokal serta memperkuat ekosistem ekonomi daerah.

Slogan “Sai Bumi, Sai Data UMKM” bermakna bahwa seluruh UMKM dalam satu bumi yaitu Bandar Lampung dihimpun menjadi satu kesatuan data yang rapi, terintegrasi, dan mudah diakses melalui satu _platform_.

>**Tujuan Pembuatan Aplikasi _Mobile_**
>
> Aplikasi ini bertujuan untuk meningkatkan keterbukaan data UMKM melalui pusat data yang terstruktur, terpadu, dan mudah diakses oleh masyarakat maupun pemangku kepentingan. Dengan menyediakan visualisasi spasial dalam bentuk peta digital, aplikasi ini memudahkan pengguna dalam menemukan lokasi UMKM, memahami persebarannya, serta melakukan analisis berbasis wilayah secara lebih intuitif. Selain itu, aplikasi ini juga memperkuat visibilitas para pelaku UMKM, sehingga usaha mereka dapat lebih dikenal dan terjangkau oleh publik. Bagi pemerintah, keberadaan aplikasi ini menjadi sarana pendukung dalam pendataan, _monitoring_, dan perencanaan kebijakan ekonomi daerah yang lebih tepat sasaran, berbasis data spasial dan kondisi riil di lapangan. Dengan demikian, aplikasi ini memberikan manfaat yang signifikan baik bagi pelaku usaha, masyarakat, maupun instansi pengelola data.


>**Komponen Pembangun**
>
>Aplikasi PEPADUN ini dikembangkan menggunakan berbagai teknologi modern yang mendukung performa, fleksibilitas, serta kemudahan integrasi. Pondasi aplikasi dibangun dengan _React Native_ sebagai _framework_ utama, sementara sistem navigasi menggunakan _expo-router_ agar struktur halaman lebih rapi dan modular. Seluruh data UMKM yang mulai dari nama, kategori, foto, kontak, hingga koordinat lokasi dapat disimpan pada _Firebase Realtime Database_ sehingga perubahan data dapat muncul secara _real-time_ di seluruh perangkat. Autentikasi pengguna dikelola oleh _Firebase Auth_, dan tampilan visual memanfaatkan _expo-image_, ikon dari _Expo Vector Icons_, serta dukungan _Dark–Light Mode_ agar responsif terhadap preferensi pengguna. Pada fitur geospasial, aplikasi menggunakan _react-native-map_s dan modul _expo-locatio_n untuk menampilkan peta digital, menandai lokasi UMKM, serta mendeteksi posisi pengguna, sehingga visualisasi spasial dapat dilakukan secara langsung melalui perangkat mobile.
>
>Selain itu, aplikasi ini dilengkapi dengan sistem komponen yang tersusun dari beberapa halaman utama, seperti halaman _login_ yang mendukung mode _Guest_, _dashboard_ dengan statistik usaha, halaman lokasi dan daftar UMKM, serta halaman peta interaktif. Pengguna yang masuk sebagai _Guest_ hanya dapat melihat data UMKM tanpa hak untuk menambah, meng-_edit_, atau menghapus data, sehingga menjaga integritas informasi. Sebaliknya, pengguna yang telah _login_ atau terdaftar memiliki akses penuh untuk mengelola data, termasuk fitur _edit_ dan _delete_ langsung dari halaman detail atau lokasi. Fitur-fitur tambahan seperti _search bar_, filter kategori, kartu statistik, FAB di peta, hingga halaman profil memberikan pengalaman penggunaan yang lengkap dan intuitif. Kehadiran mode tampilan gelap (_dark mode_) dan terang (_light mode_) juga meningkatkan kenyamanan visual, membuat aplikasi ini fungsional sekaligus ramah pengguna dalam berbagai kondisi.


>**Sumber Data**
>
>Sumber data UMKM pada aplikasi ini diperoleh melalui proses _scraping_ dari _Google Maps_, yang digunakan untuk mengambil informasi dasar seperti nama UMKM, kategori usaha, koordinat lokasi, foto tempat, serta kontak apabila tersedia. Metode ini dipilih karena mampu menyediakan data yang cukup lengkap dan aktual mengenai persebaran UMKM di wilayah Bandar Lampung. Data hasil _scraping_ kemudian disimpan dan diolah dalam _Firebase Realtime Database_ agar dapat ditampilkan secara _real-time_ pada aplikasi.


>>**Tangkapan Layar Komponen Penting pada Website**
>>_Dark Mode_
>![Halaman Awal](foto/halamanawal1.png)
>![Halaman Awal](foto/halamanawal2.png)
>![Peta Interaktif](foto/peta.png)
>>![form input](foto/form.png)
>![Tabel Data](foto/tabel1.png)
>![Tabel Data](foto/tabel2.png)
>![Halaman Lain](foto/kedaton.png)
>>
