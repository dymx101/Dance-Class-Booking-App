-- 1. Function for Waitlist Promotion Notification
CREATE OR REPLACE FUNCTION public.handle_booking_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Only trigger if status changed from 'waiting' to 'booked'
    IF (OLD.status = 'waiting' AND NEW.status = 'booked') THEN
        INSERT INTO public.notifications (userid, type, title, message)
        VALUES (
            NEW.userid, 
            'waitlist_promoted', 
            '预约成功 (Booking Successful)', 
            '您已从候补名单转为正式预约！'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Trigger for Waitlist Promotion
DROP TRIGGER IF EXISTS on_booking_promoted ON public.bookings;
CREATE TRIGGER on_booking_promoted
    AFTER UPDATE ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_booking_notification();

-- 3. Function for Purchase Confirmation Notification
CREATE OR REPLACE FUNCTION public.handle_purchase_notification()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.notifications (userid, type, title, message)
    VALUES (
        NEW.userid, 
        'purchase_successful', 
        '充值成功 (Purchase Successful)', 
        '您已成功购买 ' || NEW.cardname || '，获得 ' || NEW.passesadded || ' 次课时！'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Trigger for Purchase Confirmation
DROP TRIGGER IF EXISTS on_purchase_confirmed ON public.purchase_records;
CREATE TRIGGER on_purchase_confirmed
    AFTER INSERT ON public.purchase_records
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_purchase_notification();
