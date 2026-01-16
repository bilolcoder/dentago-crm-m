import React from 'react';
import { useNavigate } from 'react-router-dom'; // React Router kerak!

function Kurs() {
  const navigate = useNavigate();

  // Stomatologiya kurslari (statik, professional rasmlar bilan)
  const courses = [
    {
      id: 1,
      title: "Tish Implantologiyasi Intensiv Kurs",
      price: "2 500 000 so'm",
      time: "19:00 - 21:00",
      image: "https://www.implantedco.com/wp-content/uploads/2021/11/live-training-implant-education-patient-chair.jpg"
    },
    {
      id: 2,
      title: "Bolalar Stomatologiyasi (Pediatrik Dentistriya)",
      price: "1 800 000 so'm",
      time: "18:00 - 20:00",
      image: "https://www.medprodocuae.com/wp-content/uploads/2023/03/COURSE-web-01.jpg"
    },
    {
      id: 3,
      title: "Ortodontiya: Breketlar va Tishlarni To'g'rilash",
      price: "2 200 000 so'm",
      time: "20:00 - 22:00",
      image: "https://orthodontics.com/wp-content/uploads/2020/11/basic-course.jpg"
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f0f4f8',
      padding: '40px 20px',
      position: 'relative'
    }}>
      {/* Orqaga qaytish tugmasi - chap yuqori burchakda */}
      <button
        onClick={() => navigate(-1)}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          backgroundColor: '#fff',
          border: 'none',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          color: '#333',
          transition: 'all 0.3s ease',
          zIndex: 10
        }}
        onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)'}
        onMouseOut={(e) => e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)'}
      >
        ←
      </button>

      <h1 style={{
        textAlign: 'center',
        marginBottom: '50px',
        fontSize: '36px',
        color: '#333',
        fontWeight: '700'
      }}>
        Stomatologiya Kurslari
      </h1>

      {/* Kurs kartochkalari */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '30px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {courses.map((course) => (
          <div
            key={course.id}
            style={{
              background: 'white',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-10px)';
              e.currentTarget.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
            }}
          >
            {/* Kurs rasmi */}
            <div style={{
              height: '240px',
              backgroundImage: `url(${course.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }} />

            {/* Kartochka matni */}
            <div style={{ padding: '24px' }}>
              <h3 style={{
                fontSize: '22px',
                fontWeight: '600',
                color: '#2c3e50',
                margin: '0 0 12px 0'
              }}>
                {course.title}
              </h3>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '16px'
              }}>
                <div>
                  <p style={{
                    fontSize: '18px',
                    color: '#7f8c8d',
                    margin: '0 0 8px 0'
                  }}>
                    ⏰ Vaqt:
                  </p>
                  <p style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#34495e'
                  }}>
                    {course.time}
                  </p>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <p style={{
                    fontSize: '18px',
                    color: '#7f8c8d',
                    margin: '0 0 8px 0'
                  }}>
                    💰 Narxi:
                  </p>
                  <p style={{
                    fontSize: '22px',
                    fontWeight: '700',
                    color: '#27ae60'
                  }}>
                    {course.price}
                  </p>
                </div>
              </div>

              <button style={{
                width: '100%',
                marginTop: '20px',
                padding: '12px',
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background 0.3s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#2980b9'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#3498db'}
              >
                Sotib olish
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Kurs;
