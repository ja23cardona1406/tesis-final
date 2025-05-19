import React from 'react';
import { LineChart, Users, ClipboardCheck } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import DataEntryForm from './DataEntryForm';
import { IonCard, IonCardContent, IonImg, IonText } from '@ionic/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Importación de imágenes
const jaimeImg = "/img/jaime.jpg";
const carlosImg = "/img/carlos_mario.jpg";
const images = [
  "/img/imagen1.jpg",
  "/img/imagen2.jpg",
  "/img/imagen3.jpg",
  "/img/imagen4.jpg",
  "/img/imagen5.jpg",
  "/img/imagen6.jpg",
  "/img/imagen7.jpg",
  "/img/imagen8.jpg"
];

function Home() {
  const { user } = useSelector((state: RootState) => state.auth);
  const isOperator = user?.role === 'operator';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Título y descripción */}
      <div className="text-center mt-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Sistema Inteligente de Producción Lechera
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Optimiza tu producción lechera con análisis predictivo e inteligencia artificial
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-8 mt-12">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <LineChart className="h-6 w-6 text-blue-600 mr-2" />
            <h3 className="text-xl font-semibold">Análisis de Factores</h3>
          </div>
          <p className="text-gray-600">
            Monitoreo de condiciones climáticas, alimentación y prácticas de manejo que afectan la producción.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <Users className="h-6 w-6 text-blue-600 mr-2" />
            <h3 className="text-xl font-semibold">Interfaz Amigable</h3>
          </div>
          <p className="text-gray-600">
            Plataforma intuitiva para registro y visualización de datos de producción lechera.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <ClipboardCheck className="h-6 w-6 text-blue-600 mr-2" />
            <h3 className="text-xl font-semibold">Predicciones Precisas</h3>
          </div>
          <p className="text-gray-600">
            Estimaciones basadas en IA para optimizar la producción y toma de decisiones.
          </p>
        </div>
      </div>

      {/* Sección Quiénes Somos */}
      <div className="mt-16 text-center">
        <h3 className="text-3xl font-bold text-gray-900 mb-6">¿Quiénes Somos?</h3>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-12">
          Este proyecto fue desarrollado por Jaime Andrés Cardona Montero, estudiante de Ingeniería de Sistemas de la Universidad San Buenaventura Cali.
          Un agropecuario de 22 años que busca innovar en el sector agrícola en Colombia, con el apoyo de su profesor de tesis Carlos Mario Paredes.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {[{
            img: jaimeImg,
            name: "Jaime Andrés Cardona",
            description1: "Estudiante de Ingeniería de Sistemas - 22 años",
            description2: "Apasionado por la tecnología y la agroindustria"
          }, {
            img: carlosImg,
            name: "Carlos Mario Paredes",
            description1: "Profesor de tesis - 30 años",
            description2: "Especialista en Inteligencia Artificial y desarrollo de software"
          }, ].map((person, index) => (
            <IonCard key={index} className="shadow-md">
              <IonImg src={person.img} className="w-full aspect-[4/4] object-cover rounded-t-lg" />
              <IonCardContent className="text-center">
                <h4 className="text-xl font-semibold">{person.name}</h4>
                <IonText className="text-gray-600">{person.description1}</IonText>
                <IonText className="text-gray-600 block">{person.description2}</IonText>
              </IonCardContent>
            </IonCard>
          ))}
        </div>
      </div>

      {/* Carrusel de imágenes - Ahora está debajo de las cards */}
      <div className="mt-12">
        <Swiper
          modules={[Autoplay, Navigation, Pagination]}
          spaceBetween={20}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          loop={true}
          className="w-full h-[400px] rounded-lg shadow-lg"
        >
          {images.map((src, index) => (
            <SwiperSlide key={index}>
              <img
                src={src}
                alt={`Imagen ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Data Entry Section - Solo visible para operadores */}
      {isOperator && (
        <div className="mt-16">
          <DataEntryForm />
        </div>
      )}
    </div>
  );
}

export default Home;
