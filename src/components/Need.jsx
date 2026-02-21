import React from 'react';
import { useForm } from 'react-hook-form';
import { MessageSquare, Send, User, Phone } from 'lucide-react';

const Need = ({ onClose }) => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const userPhone = localStorage.getItem('userPhone') || '';

      const name = userData.name || userData.username || 'Nomaʼlum';
      const phone = userPhone || 'Telefon kiritilmagan';
      const message = data.message.trim();

      if (!message) {
        alert("Iltimos, xabar kiriting!");
        return;
      }

      const botToken = '8553471103:AAH47bf02_AgHS6Dg-_0cRc8-p7ozUJ7FvE';
      const adminChatIds = ['7548230903', '7800450778']; // Yangi adminlarni qo'shsa bo'ladi

      const text = `Yangi murojaat:\n\n👤 <b>Ism Familiya:</b> ${name}\n📱 <b>Telefon:</b> ${phone}\n\n💬 <b>Xabar:</b>\n${message}`;

      // Har bir adminga alohida yuboramiz
      for (const chatId of adminChatIds) {
        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: text,
            parse_mode: 'HTML',
          }),
        });

        const result = await response.json();
        if (!result.ok) {
          console.error(`Xato chat ${chatId} ga:`, result);
          // Bu yerda qo'shimcha xatolikni ishlatish mumkin, lekin davom etamiz
        }
      }

      // localStorage ga saqlash (agar kerak bo'lsa, oldingi kabi)
      const savedRequests = JSON.parse(localStorage.getItem('needRequests') || '[]');
      const requestWithId = {
        id: Date.now(),
        name,
        phone,
        message,
        timestamp: new Date().toISOString()
      };
      const updatedRequests = [requestWithId, ...savedRequests];
      localStorage.setItem('needRequests', JSON.stringify(updatedRequests));

      // alert('Xabaringiz muvaffaqiyatli yuborildi!');
      reset();

    } catch (error) {
      console.error('Telegram yuborish xatosi:', error);
      alert('Xabar yuborishda xato yuz berdi. Iltimos keyinroq urinib ko‘ring.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="bg-[#00C2FF] p-6 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Sizga nima kerak?</h2>
              <p className="text-white/80 text-sm">Taklif va murojaatlaringizni yuboring</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {/* Foydalanuvchi ma'lumotlari */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Foydalanuvchi:</span>
            </div>
            <div className="text-sm text-gray-600">
              {(() => {
                const userData = JSON.parse(localStorage.getItem('userData') || '{}');
                return userData.name || userData.username || 'Noma\'lum foydalanuvchi';
              })()}
            </div>

            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Telefon:</span>
            </div>
            <div className="text-sm text-gray-600">
              {localStorage.getItem('userPhone') || 'Telefon raqam mavjud emas'}
            </div>
          </div>

          {/* Xabar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Xabaringiz
            </label>
            <textarea
              {...register('message', {
                required: 'Xabar kiriting',
                minLength: { value: 10, message: 'Xabar kamida 10 belgidan iborat bo\'lishi kerak' }
              })}
              rows={5}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#00C2FF] focus:border-transparent outline-none resize-none ${
                errors.message ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Taklif, murojaat yoki savolingizni yozing..."
            />
            {errors.message && (
              <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose || (() => window.history.back())}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 bg-[#00C2FF] text-white rounded-xl font-bold hover:bg-[#0099DD] transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Yuborilmoqda...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Yuborish</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Need;
